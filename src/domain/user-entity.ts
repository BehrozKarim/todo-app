import {BaseEntity, DateTime, IEntity, SerializedEntity} from "@carbonteq/hexapp"
import { UUIDVo } from "@carbonteq/hexapp"

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

    set password(password: string | undefined) {
        this._password = password
    }

    static create(data: userSignUpData): UserEntity {
        return new UserEntity(data.username, data.email, data.password, data.name)
    }

    update(data : userSignUpData) {
        this._name = data.name
        this._username = data.username
        this._email = data.email
        super.markUpdated()
    }

    static fromSerialized(other: SerializedUserEntity): UserEntity {
        const user = new UserEntity(other.username, other.email, other.password, other.name)
        const id = UUIDVo.fromStr(other.Id).unwrap()
        user._copyBaseProps({
            Id: id,
            createdAt: other.createdAt,
            updatedAt: other.updatedAt
        })
        return user
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