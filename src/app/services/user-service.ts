import * as bcrypt from 'bcrypt'
import { UserEntity, SerializedUserEntity } from "../../domain/user-entity";
import { UserRepository } from "../../domain/user-repository";
import { UserDbRepo } from "../../infra/stores/user-db-repo";
import { UUIDVo } from "@carbonteq/hexapp";
import { AppResult } from "@carbonteq/hexapp";
import { NewUserDto, UpdateUserDto, UserLoginDto, GetUserDto, UserPasswordResetDto } from "../dto/user.dto";
import { AppError } from '@carbonteq/hexapp';

interface UserServiceInterface {
    get: (data: GetUserDto) => Promise<AppResult<SerializedUserEntity>>,
    create: (data: NewUserDto) => Promise<AppResult<SerializedUserEntity>>,
    login: (data: UserLoginDto) => Promise<AppResult<SerializedUserEntity>>,
    update: (data: UpdateUserDto) => Promise<AppResult<SerializedUserEntity>>,
    changePassword: (data: UserPasswordResetDto) => Promise<AppResult<SerializedUserEntity>>,
    delete: (data: GetUserDto) => Promise<AppResult<SerializedUserEntity>>,
}

export class UserService implements UserServiceInterface{
    constructor(private readonly model: UserRepository) {}

    async get({ userId }: GetUserDto) : Promise<AppResult<SerializedUserEntity>> {
        const userIdVo = (UUIDVo.fromStr(userId)).unwrap()
        const user = await this.model.fetchById(userIdVo)
        if (user.isErr()) {
            return AppResult.Err(user.unwrapErr())
        }
        const res = user.map((user) => user.serialize());
        return AppResult.fromResult(res);
    }

    async create(data: NewUserDto): Promise<AppResult<SerializedUserEntity>> {
        let passwordHash = undefined
        if (data.password)
            passwordHash = await bcrypt.hash(data.password, 10)
        const user = UserEntity.create({
            ...data.serialize(),
            password: passwordHash
        })
        const result = await this.model.insert(user)
        if (result.isErr()) {
            return AppResult.Err(result.unwrapErr())
        }
        return AppResult.fromResult(result.map((user) => user.serialize()));
    }

    async login(data: UserLoginDto): Promise<AppResult<SerializedUserEntity>> {
        let user;
        if (data.username)
            user = await this.model.fetchByUsername(data.username)
        else if (data.email)
            user = await this.model.fetchByEmail(data.email)
        else
            return AppResult.Err(AppError.InvalidData("Invalid Username or Email"))
        if (user.isErr()) {
            return AppResult.Err(user.unwrapErr())
        }
        const originalPassword = user.unwrap().password
        if (!originalPassword) {
            return AppResult.Err(AppError.InvalidOperation("Login with Google Account"))
        }

        const match = await bcrypt.compare(data.password, originalPassword)
        if (!match) {
            return AppResult.Err(AppError.InvalidData("Invalid Credentials"))
        }
        return AppResult.fromResult(user.map((user) => user.serialize()));
    }

    async update(data: UpdateUserDto): Promise<AppResult<SerializedUserEntity>> {
        const userIdVo = (UUIDVo.fromStr(data.userId)).unwrap()
        const user = await this.model.fetchById(userIdVo)
        if (user.isErr()) {
            return AppResult.Err(user.unwrapErr())
        }

        if (data.email) {
            const emailUser = await this.model.fetchByEmail(data.email)
            if (emailUser.isOk() && emailUser.unwrap().Id.serialize() !== data.userId) {
                return AppResult.Err(AppError.InvalidData("Email already exists"))
            }
        }

        if (data.username) {
            const usernameUser = await this.model.fetchByUsername(data.username)
            if (usernameUser.isOk() && usernameUser.unwrap().Id.serialize() !== data.userId) {
                return AppResult.Err(AppError.InvalidData("Username already exists"))
            }
        }

        const newUserData = {
            ...user.unwrap().serialize(),
            name: data.name? data.name: user.unwrap().name,
            username: data.username? data.username: user.unwrap().username,
            email: data.email? data.email: user.unwrap().email,
        }
        const updatedUser = new UserEntity(newUserData.username, newUserData.email)
        updatedUser.fromSerialized(newUserData)
        const result = await this.model.update(updatedUser)
        if (result.isErr()) {
            return AppResult.Err(result.unwrapErr())
        }
        return AppResult.fromResult(result.map((user) => user.serialize()));
    }

    async changePassword(data: UserPasswordResetDto): Promise<AppResult<SerializedUserEntity>> {
        const userIdVo = (UUIDVo.fromStr(data.userId)).unwrap()
        const user = await this.model.fetchById(userIdVo)
        if (user.isErr()) {
            return AppResult.Err(user.unwrapErr())
        }
        const currentDetails = user.unwrap()
        if (!currentDetails.password) {
            return AppResult.Err(AppError.InvalidOperation("Login with Google Account"))
        }
        const match = await bcrypt.compare(data.oldPassword, currentDetails.password)
        if (!match) {
            return AppResult.Err(AppError.InvalidData("Invalid Credentials"))
        }
        const passwordHash = await bcrypt.hash(data.newPassword, 10)
        let updatedUser = new UserEntity(currentDetails.username, currentDetails.email)
        let serializedUser = {
            ...currentDetails.serialize(),
            password: passwordHash
        }

        updatedUser.fromSerialized(serializedUser)
        const result = await this.model.update(updatedUser)
        if (result.isErr()) {
            return AppResult.Err(result.unwrapErr())
        }
        return AppResult.fromResult(result.map((user) => user.serialize()));
    }

    async delete({ userId }: GetUserDto): Promise<AppResult<SerializedUserEntity>> {
        const userIdVo = (UUIDVo.fromStr(userId)).unwrap()
        const user = await this.model.fetchById(userIdVo)
        if (user.isErr()) {
            return AppResult.Err(user.unwrapErr())
        }
        const result = await this.model.deleteById(userIdVo)
        if (result.isErr()) {
            return AppResult.Err(result.unwrapErr())
        }
        return AppResult.fromResult(result.map((user) => user.serialize()));
    }
}

const userService: UserServiceInterface = new UserService(new UserDbRepo())
export {userService, UserServiceInterface}