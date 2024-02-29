import * as bcrypt from 'bcrypt'
import { UserEntity, SerializedUserEntity } from "../../domain/user-entity";
import { UserRepository } from "../../domain/user-repository";
import { UserDbRepo } from "../../infra/Repos/user-db-repo";
import { AppResult, AppError, UUIDVo } from "@carbonteq/hexapp";
import { NewUserDto, UpdateUserDto, UserLoginDto, GetUserDto, UserPasswordResetDto } from "../dto/user.dto";
import { injectable, inject, container } from 'tsyringe';
import {matchRes, Result} from "@carbonteq/fp"
export interface UserServiceInterface {
    get: (data: GetUserDto) => Promise<AppResult<SerializedUserEntity>>,
    create: (data: NewUserDto) => Promise<AppResult<SerializedUserEntity>>,
    login: (data: UserLoginDto) => Promise<AppResult<SerializedUserEntity>>,
    update: (data: UpdateUserDto) => Promise<AppResult<SerializedUserEntity>>,
    changePassword: (data: UserPasswordResetDto) => Promise<AppResult<SerializedUserEntity>>,
    delete: (data: GetUserDto) => Promise<AppResult<SerializedUserEntity>>,
}

@injectable()
export class UserService implements UserServiceInterface{
    constructor(@inject("UserRepository") private readonly repo: UserRepository) {}

    async get({ userId }: GetUserDto) : Promise<AppResult<SerializedUserEntity>> {
        const userIdVo = (UUIDVo.fromStr(userId)).unwrap()
        const user = await this.repo.fetchById(userIdVo)
        return matchRes(user, {
            Ok: (user) => AppResult.fromResult(Result.Ok(user.serialize())),
            Err: (err) => AppResult.Err(err)
        })
    }

    async create(data: NewUserDto): Promise<AppResult<SerializedUserEntity>> {
        let passwordHash = undefined
        if (data.password)
            passwordHash = await bcrypt.hash(data.password, 10)
        const user = UserEntity.create({
            ...data.serialize(),
            password: passwordHash
        })
        const result = await this.repo.insert(user)
        return matchRes(result, {
            Ok: (user) => AppResult.fromResult(Result.Ok(user.serialize())),
            Err: (err) => AppResult.Err(err)
        })
    }

    async login(data: UserLoginDto): Promise<AppResult<SerializedUserEntity>> {
        let user;
        if (data.username)
            user = await this.repo.fetchByUsername(data.username)
        else if (data.email)
            user = await this.repo.fetchByEmail(data.email)
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
        const user = await this.repo.fetchById(userIdVo)
        if (user.isErr()) {
            return AppResult.Err(user.unwrapErr())
        }

        if (data.email) {
            const emailUser = await this.repo.fetchByEmail(data.email)
            if (emailUser.isOk() && emailUser.unwrap().Id.serialize() !== data.userId) {
                return AppResult.Err(AppError.InvalidData("Email already exists"))
            }
        }

        if (data.username) {
            const usernameUser = await this.repo.fetchByUsername(data.username)
            if (usernameUser.isOk() && usernameUser.unwrap().Id.serialize() !== data.userId) {
                return AppResult.Err(AppError.InvalidData("Username already exists"))
            }
        }
        const userEnt = user.unwrap()
        userEnt.update(data)
        const result = await this.repo.update(userEnt)
        return matchRes(result, {
            Ok: (user) => AppResult.fromResult(Result.Ok(user.serialize())),
            Err: (err) => AppResult.Err(err)
        })
    }

    async changePassword(data: UserPasswordResetDto): Promise<AppResult<SerializedUserEntity>> {
        const userIdVo = (UUIDVo.fromStr(data.userId)).unwrap()
        const userInfo = await this.repo.fetchById(userIdVo)
        if (userInfo.isErr()) {
            return AppResult.Err(userInfo.unwrapErr())
        }
        const currentDetails = userInfo.unwrap()
        if (!currentDetails.password) {
            return AppResult.Err(AppError.InvalidOperation("Login with Google Account"))
        }
        const match = await bcrypt.compare(data.oldPassword, currentDetails.password)
        if (!match) {
            return AppResult.Err(AppError.InvalidData("Invalid Credentials"))
        }
        const passwordHash = await bcrypt.hash(data.newPassword, 10)
        currentDetails.update({ password: passwordHash })

        const result = await this.repo.update(currentDetails)
        return matchRes(result, {
            Ok: (user) => AppResult.fromResult(Result.Ok(user.serialize())),
            Err: (err) => AppResult.Err(err)
        })
    }

    async delete({ userId }: GetUserDto): Promise<AppResult<SerializedUserEntity>> {
        const userIdVo = (UUIDVo.fromStr(userId)).unwrap()
        const user = await this.repo.fetchById(userIdVo)
        if (user.isErr()) {
            return AppResult.Err(user.unwrapErr())
        }
        const result = await this.repo.deleteById(userIdVo)
        return matchRes(result, {
            Ok: (user) => AppResult.fromResult(Result.Ok(user.serialize())),
            Err: (err) => AppResult.Err(err)
        })
    }
}