import {
    RepositoryResult,
    AlreadyExistsError,
    NotFoundError,
    Logger,
    UUIDVo,
    InvalidOperation,
} from '@carbonteq/hexapp';
import * as fp from '@carbonteq/fp';
import { UserEntity, IUser } from '../../domain/user-entities';
import { UserAlreadyExistsError, UserNotFoundError, UserInvalidOperationError } from '../../domain/user-entity-exceptions';
import { UserRepository } from '../../domain/user-repository';
import { PrismaClient } from '@prisma/client';
// import { Err, Ok } from 'oxide.ts';

const prisma = new PrismaClient();

export class UserDbRepo extends UserRepository {
    async fetchByUsername(username: string): Promise<RepositoryResult<UserEntity, UserNotFoundError>> {
        try {
            const user = await prisma.user.findUnique({
                where: { username: username },
            })

            if (!user) {
                const err = new UserNotFoundError(username, "username")
                return fp.Result.Err(err)
            }
            const ent = new UserEntity(user.name, user.username, user.email, user.password)
            const data = {
                Id: user.userId,
                name: user.name,
                username: user.username,
                email: user.email,
                password: user.password,
                updatedAt: user.updatedAt,
                createdAt: user.createdAt
            }
            ent.fromSerialized(data)
            return fp.Result.Ok(ent)
        } catch (error) {
            return fp.Result.Err(new UserNotFoundError(username, "username"))
        }
    }

    async fetchByEmail(email: string): Promise<RepositoryResult<UserEntity, UserNotFoundError>> {
        try {
            const user = await prisma.user.findUnique({
                where: { email: email },
            })

            if (!user) {
                const err = new UserNotFoundError(email, "email")
                return fp.Result.Err(err)
            }
            const ent = new UserEntity(user.name, user.username, user.email, user.password)
            const data = {
                Id: user.userId,
                name: user.name,
                username: user.username,
                email: user.email,
                password: user.password,
                updatedAt: user.updatedAt,
                createdAt: user.createdAt
            }
            ent.fromSerialized(data)
            return fp.Result.Ok(ent)
        } catch (error) {
            return fp.Result.Err(new UserNotFoundError(email, "email"))
        }
    }

    async insert(user: UserEntity): Promise<RepositoryResult<UserEntity, UserAlreadyExistsError>> {
        try {
            const createdUser = await prisma.user.create({
                data: {
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    password: user.password,
                    userId: user.Id.serialize(),
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                },
            })
            return fp.Result.Ok(user)
        } catch (error) {
            return fp.Result.Err(new UserAlreadyExistsError(user.username, "username"))
        }
    }

    async update(user: UserEntity): Promise<RepositoryResult<UserEntity, UserNotFoundError>> {
        try {
            const updatedUser = await prisma.user.update({
                where: { userId: user.Id.serialize() },
                data: {
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    password: user.password,
                    updatedAt: user.updatedAt
                },
            })
            return fp.Result.Ok(user)
        } catch (error) {
            return fp.Result.Err(new UserNotFoundError(user.username, "username"))
        }
    }

    async deleteById(Id: UUIDVo): Promise<RepositoryResult<UserEntity, UserNotFoundError>> {
        try {
            const user = await prisma.user.delete({
                where: { userId: Id.serialize() },
            })
            
            const ent = new UserEntity(user.name, user.username, user.email, user.password)
            const data = {
                Id: user.userId,
                name: user.name,
                username: user.username,
                email: user.email,
                password: user.password,
                updatedAt: user.updatedAt,
                createdAt: user.createdAt
            }
            ent.fromSerialized(data)
            return fp.Result.Ok(ent)
        } catch (error) {
            return fp.Result.Err(new UserNotFoundError(Id.serialize(), "id"))
        }
    }

    async fetchAll(): Promise<RepositoryResult<UserEntity[], UserInvalidOperationError>> {
        return fp.Result.Err(new UserInvalidOperationError('Fetching all users is not supported'));
    }

    async fetchById(id: UUIDVo): Promise<RepositoryResult<UserEntity, UserNotFoundError>> {
        try {
            const user = await prisma.user.findUnique({
                where: { userId: id.serialize() },
            })

            if (!user) {
                const err = new UserNotFoundError(id.serialize(), "id")
                return fp.Result.Err(err)
            }
            const ent = new UserEntity(user.name, user.username, user.email, user.password)
            const data = {
                Id: user.userId,
                name: user.name,
                username: user.username,
                email: user.email,
                password: user.password,
                updatedAt: user.updatedAt,
                createdAt: user.createdAt
            }
            ent.fromSerialized(data)
            return fp.Result.Ok(ent)
        } catch (error) {
            return fp.Result.Err(new UserNotFoundError(id.serialize(), "id"))
        }
    }


}