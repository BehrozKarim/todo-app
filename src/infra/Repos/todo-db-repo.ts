import {
    RepositoryResult,
    UUIDVo,
} from '@carbonteq/hexapp';
import * as fp from '@carbonteq/fp';

import { TaskEntity } from '../../domain/todo-entity';
import { TaskNotFoundError, TaskAlreadyExistsError, TaskInvalidOperationError } from '../../domain/todo-entity-exceptions';
import { TodoRepository } from '../../domain/todo-repository';
import prisma from '../client/prisma-client';
// const prisma = new PrismaClient();

export class TodoDbRepo extends TodoRepository {
    async fetchById(id: UUIDVo): Promise<RepositoryResult<TaskEntity, TaskNotFoundError>> {
        try {
            const task = await prisma.todo.findUnique({
                where: { id: id.serialize() },
            })

            if (!task) {
                return fp.Result.Err(new TaskNotFoundError(id.serialize()))
            }

            const data = {
                Id: task.id,
                title: task.title,
                description: task.description,
                completed: task.completed,
                userId: task.userId,
                updatedAt: task.updatedAt,
                createdAt: task.createdAt
            }
            const ent = TaskEntity.fromSerialized(data)
            return fp.Result.Ok(ent)
        } catch (error) {
            return fp.Result.Err(new TaskNotFoundError(id.serialize()))
        }
    }

    async insert(entity: TaskEntity): Promise<RepositoryResult<TaskEntity, TaskAlreadyExistsError>> {
        try {
            const data = {
                id: entity.Id.serialize(),
                title: entity.title,
                description: entity.description,
                completed: entity.completed,
                userId: entity.userId,
            }
            const task = await prisma.todo.create({
                data: data
            })
            return fp.Result.Ok(entity)
        } catch (error) {
            return fp.Result.Err(new TaskAlreadyExistsError(entity.Id.serialize()))
        }
    }

    async deleteById(Id: UUIDVo): Promise<RepositoryResult<TaskEntity, TaskNotFoundError>> {
        try {
            const task = await prisma.todo.delete({
                where: { id: Id.serialize() },
            })

            if (!task) {
                return fp.Result.Err(new TaskNotFoundError(Id.serialize()))
            }

            const data = {
                Id: task.id,
                title: task.title,
                description: task.description,
                completed: task.completed,
                userId: task.userId,
                updatedAt: task.updatedAt,
                createdAt: task.createdAt
            }
            const ent = TaskEntity.fromSerialized(data)
            return fp.Result.Ok(ent)
        } catch (error) {
            return fp.Result.Err(new TaskNotFoundError(Id.serialize()))
        }
    }

    async fetchByUserId(userId: string, page: number): Promise<RepositoryResult<TaskEntity[], TaskNotFoundError>> {
        try {
            const tasks = await prisma.todo.findMany({
                where: { userId: userId },
                skip: (page - 1) * 10,
                take: 10
            })

            if (!tasks) {
                return fp.Result.Err(new TaskNotFoundError(userId))
            }

            const ent = tasks.map(task => {
                const data = {
                    Id: task.id,
                    title: task.title,
                    description: task.description,
                    completed: task.completed,
                    userId: task.userId,
                    updatedAt: task.updatedAt,
                    createdAt: task.createdAt
                }
                const ent = TaskEntity.fromSerialized(data)
                return ent
            })

            return fp.Result.Ok(ent)
        } catch (error) {
            return fp.Result.Err(new TaskNotFoundError(userId))
        }
    }

    async update(entity: TaskEntity): Promise<RepositoryResult<TaskEntity, TaskNotFoundError>> {
        try {
            const task = await prisma.todo.update({
                where: { id: entity.Id.serialize() },
                data: {
                    title: entity.title,
                    description: entity.description,
                    completed: entity.completed,
                },
            })

            if (!task) {
                return fp.Result.Err(new TaskNotFoundError(entity.Id.serialize()))
            }
            const data = {
                Id: task.id,
                title: task.title,
                description: task.description,
                completed: task.completed,
                userId: task.userId,
                updatedAt: task.updatedAt,
                createdAt: task.createdAt
            }
            const ent = TaskEntity.fromSerialized(data)
            return fp.Result.Ok(ent)

        } catch (error) {
            return fp.Result.Err(new TaskNotFoundError(entity.Id.serialize()))
        }
    }

    async fetchAll(): Promise<RepositoryResult<TaskEntity[], TaskInvalidOperationError>> {
        return fp.Result.Err(new TaskInvalidOperationError('This operation is not supported'))
    }
}