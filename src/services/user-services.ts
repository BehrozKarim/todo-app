import { PrismaClient} from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import * as bcrypt from "bcrypt";
import { createToken } from "../utils/utils";

const prisma = new PrismaClient();

type userData = {
    name?: string,
    username: string,
    email: string,
    password: string,
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

export async function createUserService(data: userData) {
    const passwordHash = await bcrypt.hash(data.password, 10)
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

export async function loginService(password: string, username?: string, email?: string) {
    if ((!username && !email) || !password ) {
        return null
    }

    let user;
    if (username) {
        user = await prisma.user.findUnique({
            where: { username: username },
        })
    }
    else if (email) {
        user = await prisma.user.findUnique({
            where: { email: email},
        })
    }

    if (user) {
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

export async function getUserService(id: string) {
    const user = await prisma.user.findUnique({
        where: { id: id },
    }).catch((err) => {
        console.log(err)
        return null
    })
    return user
}

export async function updateUserService(id: string, data: updateData) {
    const currentUser = await prisma.user.findUnique({
        where: { id: id },
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
        where: { id: id },
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

export async function deleteUserService(id: string) {
    const user = await prisma.user.delete({
        where: { id: id },
    }).catch((err) => {
        console.log(err)
        return null
    })
    return user
}

export async function changePasswordService(id: string, data: passwordData) {
    const currentUser = await prisma.user.findUnique({
        where: { id: id },
    }).catch((err) => {
        console.log(err)
        return null
    })
    if (!currentUser) {
        return null
    }

    if (await bcrypt.compare(data.oldPassword, currentUser.password)) {
        const passwordHash = await bcrypt.hash(data.newPassword, 10)
        const user = await prisma.user.update({
            where: { id: id },
            data: {
                password: passwordHash,
            },
        }).catch((err) => {
            console.log(err)
            return null
        })
        return user
    } else {
        return null
    }
}