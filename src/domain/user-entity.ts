import {BaseEntity, DateTime, IEntity, SerializedEntity} from "@carbonteq/hexapp"

type userSignUpData = {
    name?: string,
    username: string,
    email: string,
    password?: string,
}

export interface IUser extends IEntity {
    name?: string,
    username: string,
    email: string,
    password?: string,
}

export interface SerializedUserEntity extends SerializedEntity {
    name?: string,
    username: string,
    email: string,
    password?: string,
    updatedAt: DateTime,
}

export class UserEntity extends BaseEntity implements IUser{
    private _name?: string
    private _username: string
    private _email: string
    private _password?: string

    private constructor(username: string, email: string, password?: string, name?: string) {
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
        return new UserEntity(data.username, data.email, data.password, data.name)
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