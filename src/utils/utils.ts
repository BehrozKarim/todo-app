import * as jwt from 'jsonwebtoken'
import { SerializedUserEntity } from '../domain/user-entity'

type User = {
    userId: string,
}

type mailData = {
    subject: string,
    data: string,
    userId: string,
}

async function createToken(user: User) {
    const token = jwt.sign(
        { id: user.userId},
        process.env.JWT_SECRET as string, 
        {expiresIn: '1d',}
        )
    return token
}

export type userData = {
    name?: string,
    username: string,
    email: string,
    password?: string,
}

export type userReturnData = {
    token: string,
    userId: string,
    name: string | undefined,
    username: string,
    email: string,
    updatedAt: Date,
    createdAt: Date,
}

export async function cleanLoginData(data: SerializedUserEntity){
    const token = await createToken({userId: data.Id})
    const user: userReturnData = {
        token: token,
        userId: data.Id,
        name: data.name,
        username: data.username,
        email: data.email,
        updatedAt: data.updatedAt,
        createdAt: data.createdAt,
    }
    return user
}

export async function cleanUserData(data: SerializedUserEntity){
    return {
        userId: data.Id,
        name: data.name,
        username: data.username,
        email: data.email,
        updatedAt: data.updatedAt,
        createdAt: data.createdAt,
    }
}

export { createToken, mailData }