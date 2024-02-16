// validate username doesn't exist already
import { PrismaClient } from '@prisma/client'
import * as jwt from 'jsonwebtoken'
import {userModel} from '../infra/stores/user-store'

const prisma = new PrismaClient()

type User = {
    userId: string,
}

type mailData = {
    subject: string,
    data: string,
    userId: string,
}

async function usernameExists(username: string) {
    const [err, user] = (await userModel.findByUsername(username)).intoTuple()
    if (user) {
        return true
    } else {
        return false
    }
}

async function emailExists(email: string) {
    const [err, user] = (await userModel.findByEmail(email)).intoTuple()
    if (user) {
        return true
    } else {
        return false
    }
}

async function createToken(user: User) {
    const token = jwt.sign(
        { id: user.userId},
        process.env.JWT_SECRET as string, 
        {expiresIn: '1d',}
        )
    return token
}

export { usernameExists, createToken, emailExists, mailData }