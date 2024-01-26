import { PrismaClient} from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import * as bcrypt from "bcrypt";
import { createToken } from "../utils/utils";

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


interface User {
    findById: (id: string) => Promise<userData | null>,
    findByUsername: (username: string) => Promise<userData | null>,
    findByEmail: (email: string) => Promise<userData | null>,
    create: (data: userSignUpData) => Promise<userData | null>,
    update: (data: updateData, userId: string) => Promise<userData | null>,
    delete: (userId: string) => Promise<userData | null>,
    changePassword: (passwordHash: string, userId: string) => Promise<userData | null>,
}

class PrismaUser implements User {
    async findById(id: string): Promise<userData | null> {
        const user = await prisma.user.findUnique({
            where: { userId: id },
        }).catch((err) => {
            console.log(err)
            return null
        })
        return user
    }

    async findByUsername(username: string): Promise<userData | null> {
        const user = await prisma.user.findUnique({
            where: { username: username },
        }).catch((err) => {
            console.log(err)
            return null
        })
        return user
    }

    async findByEmail(email: string): Promise<userData | null> {
        const user = await prisma.user.findUnique({
            where: { email: email },
        }).catch((err) => {
            console.log(err)
            return null
        })
        return user
    }


    async create(data: userSignUpData): Promise<userData | null> {
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
        }).catch((err) => {
            console.log(err)
            return null
        })
        return user
    }

    async update(data: updateData, userId: string): Promise<userData | null> {
        const user = await prisma.user.update({
            where: { userId: userId },
            data: {
                name: data.name,
                username: data.username,
                email: data.email,
            },
            })
            .catch((err) => {
                console.log(err)
                return null
            })
        return user
    }

    async delete(userId: string): Promise<userData | null> {
        const user = await prisma.user.delete({
            where: { userId: userId },
        }).catch((err) => {
            console.log(err)
            return null
        })
        return user
    }

    async changePassword(passwordHash: string, userId: string): Promise<userData | null> {
        const updatedUser = await prisma.user.update({
            where: { userId: userId },
            data: {
                password: passwordHash,
            },
        }).catch((err) => {
            console.log(err)
            return null
        }
        )
        return updatedUser
    }
}

const userModel: User = new PrismaUser()

export default userModel