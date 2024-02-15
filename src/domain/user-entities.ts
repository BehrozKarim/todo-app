import { Result } from "oxide.ts"
import { UserNotFoundError, UserAlreadyExistsError, UserInvalidOperationError } from "./user-store-errors";

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

export {User, userData, userSignUpData, updateData, storeResult}