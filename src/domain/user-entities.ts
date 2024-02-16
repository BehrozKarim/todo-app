import { Result } from "oxide.ts"
import {BaseEntity, IEntity, UUIDVo, SerializedEntity} from "@carbonteq/hexapp"

type userSignUpData = {
    name: string | null,
    username: string,
    email: string,
    password: string | null,
}

export interface IUser extends IEntity {
    name: string | null,
    username: string,
    email: string,
    password: string | null,
}

export interface SerializedUserEntity extends SerializedEntity {
    name: string | null,
    username: string,
    email: string,
    password: string | null,
}
export class UserEntity extends BaseEntity implements IUser{
    private _name: string | null
    private _username: string
    private _email: string
    private _password: string | null

    constructor(name: string | null, username: string, email: string, password: string | null) {
        super()
        this._name = name
        this._username = username
        this._email = email
        this._password = password
    }

    get name() {
        return this._name
    }

    get username() {
        return this._username
    }

    get email() {
        return this._email
    }

    get password() {
        return this._password
    }

    static create(data: userSignUpData): UserEntity {
        return new UserEntity(data.name, data.username, data.email, data.password)
    }

    fromSerialized(other: SerializedUserEntity): void {
        super._fromSerialized(other)
        this._name = other.name
        this._username = other.username
        this._email = other.email
        this._password = other.password
    }

    serialize() :SerializedUserEntity{
        return {
            ...super._serialize(),
            name: this.name,
            username: this.username,
            email: this.email,
            password: this.password
        }
    }
}


// type updateData = {
//     name?: string,
//     username?: string,
//     email?: string,
// }

// type storeResult <T, E = UserInvalidOperationError> = Result<
//     T,
//     E | UserInvalidOperationError>

// interface User {
//     findById: (id: string) => Promise<storeResult<userData, UserNotFoundError>>,
//     findByUsername: (username: string) => Promise<storeResult<userData, UserNotFoundError>>,
//     findByEmail: (email: string) => Promise<storeResult<userData, UserNotFoundError>>,
//     create: (data: userSignUpData) => Promise<storeResult<userData, UserAlreadyExistsError>>,
//     update: (data: updateData, userId: string) => Promise<storeResult<userData, UserNotFoundError>>,
//     delete: (userId: string) => Promise<storeResult<userData, UserNotFoundError>>,
//     changePassword: (passwordHash: string, userId: string) => Promise<storeResult<userData, UserNotFoundError>>,
// }

// export {User, userData, userSignUpData, updateData, storeResult}