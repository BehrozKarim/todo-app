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

type passwordData = {
    oldPassword: string,
    newPassword: string,
}

type userData = {
    id: string,
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
    changePassword: (data: passwordData, userId: string) => Promise<userData | null>,
}

class PrismaUser implements User {
    async findById(id: string): Promise<userData | null> {
        const user = await prisma.user.findUnique({
            where: { id: id },
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
                id: uuidv4(),
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
        const currentUser = await prisma.user.findUnique({
            where: { id: userId},
        }).catch((err) => {
            console.log(err)
            return null
        })
        if (!currentUser) {
            return null
        }

        let name = data.name ? data.name : currentUser.name
        let username = data.username ? data.username : currentUser.username
        let email = data.email ? data.email : currentUser.email

        const user = await prisma.user.update({
            where: { id: currentUser.id},
            data: {
                name: name,
                username: username,
                email: email,
            },
        }).catch((err) => {
            console.log(err)
            return null
        })
        return user
    }

    async delete(userId: string): Promise<userData | null> {
        const user = await prisma.user.delete({
            where: { id: userId },
        }).catch((err) => {
            console.log(err)
            return null
        })
        return user
    }

    async changePassword(data: passwordData, userId: string): Promise<userData | null> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        }).catch((err) => {
            console.log(err)
            return null
        })
        if (!user) {
            return null
        }
        if (user.password){
            const passwordMatch = await bcrypt.compare(data.oldPassword, user.password)
            if (!passwordMatch) {
                return null
            }
        }
        const passwordHash = await bcrypt.hash(data.newPassword, 10)
        const updatedUser = await prisma.user.update({
            where: { id: userId },
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

async function loginService(password: string, username?: string, email?: string) {
    if ((!username && !email) || !password ) {
        return null
    }

    let user;
    if (username) {
        user = await userModel.findByUsername(username)
    }
    else if (email) {
        user = await userModel.findByEmail(email)
    }

    if (user && user.password) {
        if (await bcrypt.compare(password, user.password)) {            
            const token = await createToken({id: user.id})
            return token
        } else {
            return null
        }
    } else {
        return null
    }
}

export { userModel, loginService }