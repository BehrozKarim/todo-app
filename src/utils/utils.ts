import * as jwt from 'jsonwebtoken'
import { SerializedUserEntity } from '../domain/user-entity'
import { AppResult, AppErrStatus, AppError } from '@carbonteq/hexapp'
import logger from '../infra/logger'

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

export async function cleanLoginData(data: SerializedUserEntity | string){
    if (typeof data === 'string') {
        return data
    }
    const token = await createToken({userId: data.Id})
    const user = {
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

export async function cleanUserData(data: SerializedUserEntity | string){
    if (typeof data === 'string') {
        return data
    }
    return {
        userId: data.Id,
        name: data.name,
        username: data.username,
        email: data.email,
        updatedAt: data.updatedAt,
        createdAt: data.createdAt,
    }
}

// declare an enum to map stauts codes to AppErrStatus
enum ErrStatusCode {
    "NotFound" = 404,
    "Unauthorized" = 401,
    "InvalidData" = 400,
    "InvalidOperation" = 400,
    "AlreadyExists" = 409,
    "ExternalServiceFailure" = 500,
    "Generic" = 500,
}

export interface HttpResponseData {
    status: number,
    data: any,
}

export class HttpResponse {
    
    static fromAppResult<T>(result: AppResult<T>) {
        if (result.isErr()) {
            return {
                status: ErrStatusCode[result.unwrapErr().status],
                data: result.unwrapErr().message,
            
            }
        }
        return {
            status: 200,
            data: result.unwrap(),
        }
    }

    static fromAppError<T>(error: AppError) {
        logger.error(error.message)
        return {
            status: ErrStatusCode[error.status],
            data: error.message,
        }
    }

    static fromData<T>(data: T) {
        return {
            status: 200,
            data: data,
        }
    }
}

export { createToken, mailData }