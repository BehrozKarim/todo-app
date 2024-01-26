// validate username doesn't exist already
import { PrismaClient } from '@prisma/client'
import * as jwt from 'jsonwebtoken'
import {userModel} from '../domain/stores/user-store'

const prisma = new PrismaClient()

type User = {
    userId: string,
}

async function usernameExists(username: string) {
    const user = await userModel.findByUsername(username)
    if (user) {
        return true
    } else {
        return false
    }
}

async function emailExists(email: string) {
    const user = await userModel.findByEmail(email)
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

export { usernameExists, createToken, emailExists }