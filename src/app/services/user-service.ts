import {createToken} from "../../utils/utils";
import * as bcrypt from 'bcrypt'
import { UserEntity, SerializedUserEntity } from "../../domain/user-entity";
import { UserRepository } from "../../domain/user-repository";
import { UserDbRepo } from "../../infra/stores/user-db-repo";
import { UUIDVo } from "@carbonteq/hexapp";
import logger from "../../infra/logger";
import { userData } from "../../utils/utils";

import { AppResult } from "@carbonteq/hexapp";
import { NewUserDto, UpdateUserDto, UserLoginDto, GetUserDto, UserPasswordResetDto } from "../dto/user.dto";

type userReturnData = {
    message: string,
    token?: string,
    expiresIn?: string,
    userId: string,
    name: string | null,
    username: string,
    email: string,
    status: number,
}

type errorData = {
    message: string,
    status : number,
}

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
            return AppResult.Err(new Error("Invalid Credentials"))
        if (user.isErr()) {
            return AppResult.Err(user.unwrapErr())
        }
        const originalPassword = user.unwrap().password
        if (!originalPassword) {
            return AppResult.Err(new Error("Login with Google Account"))
        }

        const match = await bcrypt.compare(data.password, originalPassword)
        if (!match) {
            return AppResult.Err(new Error("Invalid Credentials"))
        }
        return AppResult.fromResult(user.map((user) => user.serialize()));
    }

    async update(data: UpdateUserDto): Promise<AppResult<SerializedUserEntity>> {
        const userIdVo = (UUIDVo.fromStr(data.userId)).unwrap()
        const user = await this.model.fetchById(userIdVo)
        if (user.isErr()) {
            return AppResult.Err(user.unwrapErr())
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
            return AppResult.Err(new Error("Login with Google Account"))
        }
        const match = await bcrypt.compare(data.oldPassword, currentDetails.password)
        if (!match) {
            return AppResult.Err(new Error("Invalid Credentials"))
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

/*
interface UserServiceInterface {
    create: (data: userData) => Promise<userReturnData | errorData>,
    login: (username: string, password: string, email: string) => Promise<userReturnData | errorData>,
    update: (data: userData, userId: string) => Promise<userReturnData | errorData>,
    changePassword: (oldPassword: string, newPassword: string, userId: string) => Promise<userReturnData | errorData>,
    delete: (userId: string) => Promise<userReturnData | errorData>,
    get: (userId: string) => Promise<userReturnData | errorData>,
}

export class UserService implements UserServiceInterface{
    private model: UserRepository;
    constructor(model: UserRepository) {
        this.model = model
    }
    async get(userId: string): Promise<userReturnData | errorData> {
        const userIdVo = (UUIDVo.fromStr(userId)).unwrap()
        const user = await this.model.fetchById(userIdVo)
        if (user.isErr()) {
            return {
                message: user.unwrapErr().message,
                status: 404,
            }
        }

        return {
            message: "User Details Fetched Successfully",
            userId: user.unwrap().Id.serialize(),
            username: user.unwrap().username,
            name: user.unwrap().name,
            email: user.unwrap().email,
            status: 200,
        }
    }

    async create(data: userData): Promise<userReturnData | errorData> {
        if (data.password)
            data.password = await bcrypt.hash(data.password, 10)
        const user = UserEntity.create(data)
        const result = await this.model.insert(user)
        if (result.isErr()) {
            return {
                message: result.unwrapErr().message,
                status: 400,
            }
        }
        const token = await createToken({userId: result.unwrap().Id.serialize()})
        return {
            message: "User Created Successfully",
            token: token,
            expiresIn: '1d',
            userId: result.unwrap().Id.serialize(),
            email: result.unwrap().email,
            username: result.unwrap().username,
            name: result.unwrap().name,
            status: 201,
        }
    }

    async login(username: string, password: string, email: string): Promise<userReturnData | errorData> {
        let user = await this.model.fetchByUsername(username)
        if (user.isErr()) {
            user = await this.model.fetchByEmail(email)
            if (user.isErr()) {
                logger.info(user.unwrapErr().message)
                return {
                    message: "Invalid Credentials",
                    status: 400,
                }
            }
        }
        const originalPassword = user.unwrap().password
        if (!originalPassword) {
            return {
                message: "Login with Google Account",
                status: 400,
            }
        }

        const match = await bcrypt.compare(password, originalPassword)
        if (!match) {
            return {
                message: "Invalid Credentials",
                status: 400,
            }
        }

        const token = await createToken({userId: user.unwrap().Id.serialize()})
        return {
            message: "Logged In Successfully",
            token: token,
            expiresIn: '1d',
            userId: user.unwrap().Id.serialize(),
            email: user.unwrap().email,
            username: user.unwrap().username,
            name: user.unwrap().name,
            status: 200,
        }
    }

    async update(data: userData, userId: string): Promise<userReturnData | errorData> {
        const userIdVo = (UUIDVo.fromStr(userId)).unwrap()
        const user = await this.model.fetchById(userIdVo)
        if (user.isErr()) {
            return {
                message: user.unwrapErr().message,
                status: 404,
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
            return {
                message: result.unwrapErr().message,
                status: 404,
            }
        }
        return {
            message: "User Updated Successfully",
            userId: result.unwrap().Id.serialize(),
            username: result.unwrap().username,
            name: result.unwrap().name,
            email: result.unwrap().email,
            status: 200,
        }
    }

    async changePassword(oldPassword: string, newPassword: string, userId: string): Promise<userReturnData | errorData> {
        const userIdVo = (UUIDVo.fromStr(userId)).unwrap()
        const user = await this.model.fetchById(userIdVo)
        if (user.isErr()) {
            return {
                message: user.unwrapErr().message,
                status: 404,
            }
        }
        const currentDetails = user.unwrap()
        if (!currentDetails.password) {
            return {
                message: "Login with Google Account",
                status: 400,
            }
        }
        const match = await bcrypt.compare(oldPassword, currentDetails.password)
        if (!match) {
            logger.info(`Old Password: ${oldPassword} and Current Password: ${currentDetails.password}`)
            return {
                message: "Invalid Credentials",
                status: 400,
            }
        }
        const passwordHash = await bcrypt.hash(newPassword, 10)
        let updatedUser = new UserEntity(currentDetails.username, currentDetails.email)
        let serializedUser = {
            ...currentDetails.serialize(),
            password: passwordHash
        }

        updatedUser.fromSerialized(serializedUser)
        const result = await this.model.update(updatedUser)
        if (result.isErr()) {
            return {
                message: result.unwrapErr().message,
                status: 404,
            }
        }
        return {
            message: "Password Changed Successfully",
            userId: result.unwrap().Id.serialize(),
            username: result.unwrap().username,
            name: result.unwrap().name,
            email: result.unwrap().email,
            status: 200,
        }
    }

    async delete(userId: string): Promise<userReturnData | errorData> {
        const userIdVo = (UUIDVo.fromStr(userId)).unwrap()
        const user = await this.model.fetchById(userIdVo)
        if (user.isErr()) {
            return {
                message: user.unwrapErr().message,
                status: 404,
            }
        }
        const result = await this.model.deleteById(userIdVo)
        if (result.isErr()) {
            return {
                message: result.unwrapErr().message,
                status: 404,
            }
        }
        return {
            message: "User Deleted Successfully",
            userId: result.unwrap().Id.serialize(),
            username: result.unwrap().username,
            name: result.unwrap().name,
            email: result.unwrap().email,
            status: 200,
        }
    }
}
*/
const userService: UserServiceInterface = new UserService(new UserDbRepo())
const nUserService: UserService = new UserService(new UserDbRepo())
export {userService, UserServiceInterface, nUserService}