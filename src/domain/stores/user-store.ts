import { PrismaClient} from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import * as bcrypt from "bcrypt";
import { createToken } from "../../utils/utils";
import logger from "../../shared/logger";
import { Result, Ok, Err } from "oxide.ts"
import { UserNotFoundError, UserAlreadyExistsError, UserInvalidOperationError } from "./user-store-errors";
const prisma = new PrismaClient();


type userSignUpData = {
    name?: string,
    username: string,
    email: string,
    password?: string,
}

type updateData = {
    name?: string,
    username?: string,
    email?: string,
}

type userData = {
    userId: string,
    name: string | null,
    username: string,
    email: string,
    password: string | null,
    updatedAt: Date,
    createdAt: Date,
}

type storeResult <T, E = UserInvalidOperationError> = Result<
    T,
    E | UserInvalidOperationError>

interface User {
    findById: (id: string) => Promise<storeResult<userData, UserNotFoundError>>,
    findByUsername: (username: string) => Promise<storeResult<userData, UserNotFoundError>>,
    findByEmail: (email: string) => Promise<storeResult<userData, UserNotFoundError>>,
    create: (data: userSignUpData) => Promise<storeResult<userData, UserAlreadyExistsError>>,
    update: (data: updateData, userId: string) => Promise<storeResult<userData, UserNotFoundError>>,
    delete: (userId: string) => Promise<storeResult<userData, UserNotFoundError>>,
    changePassword: (passwordHash: string, userId: string) => Promise<storeResult<userData, UserNotFoundError>>,
}

class PrismaUser implements User {
    async findById(id: string): Promise<storeResult<userData, UserNotFoundError>> {
        const user = await prisma.user.findUnique({
            where: { userId: id },
        })

        if (!user) {
            return Err(new UserNotFoundError(id, "id"))
        }

        return Ok(user)
    }

    async findByUsername(username: string): Promise<storeResult<userData, UserNotFoundError>> {
        const user = await prisma.user.findUnique({
            where: { username: username },
        })

        if (!user) {
            return Err(new UserNotFoundError(username, "username"))
        }

        return Ok(user)
    }

    async findByEmail(email: string): Promise<storeResult<userData, UserNotFoundError>> {
        const user = await prisma.user.findUnique({
            where: { email: email },
        })

        if (!user) {
            return Err(new UserNotFoundError(email, "email"))
        }

        return Ok(user)
    }


    async create(data: userSignUpData): Promise<storeResult<userData, UserAlreadyExistsError>> {
        let passwordHash = null
        if (data.password){
            passwordHash = await bcrypt.hash(data.password, 10)
        }
        const user = await prisma.user.create({
            data: {
                userId: uuidv4(),
                name: data.name,
                username: data.username,
                email: data.email,
                password: passwordHash,
            },
        })

        if (!user) {
            return Err(new UserAlreadyExistsError(data.username, "username"))
        }

        return Ok(user)
    }

    async update(data: updateData, userId: string): Promise<storeResult<userData, UserNotFoundError>> {
        const user = await prisma.user.update({
            where: { userId: userId },
            data: {
                name: data.name,
                username: data.username,
                email: data.email,
            },
        })

        if (!user) {
            return Err(new UserNotFoundError(userId, "id"))
        }

        return Ok(user)
    }

    async delete(userId: string): Promise<storeResult<userData, UserNotFoundError>> {
        const user = await prisma.user.delete({
            where: { userId: userId },
        })

        if (!user) {
            return Err(new UserNotFoundError(userId, "id"))
        }

        return Ok(user)
    }

    async changePassword(passwordHash: string, userId: string): Promise<storeResult<userData, UserNotFoundError>> {
        const updatedUser = await prisma.user.update({
            where: { userId: userId },
            data: {
                password: passwordHash,
            },
        })

        if (!updatedUser) {
            return Err(new UserNotFoundError(userId, "id"))
        }

        return Ok(updatedUser)
    }
}

const userModel: User = new PrismaUser()

export {
    userModel, User, PrismaUser
}