import { PrismaClient } from '@prisma/client'
import {v4 as uuidv4} from 'uuid'
const prisma = new PrismaClient()
import logger from '../../shared/logger'
import {Result, Ok, Err} from 'oxide.ts'
import { TaskNotFoundError, TaskAlreadyExistsError, TaskInvalidOperationError } from './todo-store-errors'

type TaskCreationData = {
    title: string,
    description: string,
    userId: string,
}

type updateData = {
    id: string,
    title?: string,
    description?: string,
    completed?: boolean,
}

type TaskData = {
    id: string,
    title: string,
    description: string,
    completed: boolean,
    userId: string,
    createdAt: Date,
    updatedAt: Date,
}

type storeResult <T, E = TaskInvalidOperationError> = Result<
    T,
    E | TaskInvalidOperationError
>

interface Task {
    create: (data: TaskCreationData) => Promise<storeResult<TaskData, TaskAlreadyExistsError>>,
    get: (id: string) => Promise<storeResult<TaskData, TaskNotFoundError>>,
    update: (data: updateData) => Promise<storeResult<TaskData, TaskNotFoundError>>,
    delete: (id: string) => Promise<storeResult<TaskData, TaskNotFoundError>>,
    getAllUserTasks: (userId: string, page: number) => Promise<storeResult<TaskData[], TaskNotFoundError>>,
}

class PrismaTask implements Task{
    async create(data: TaskCreationData): Promise<storeResult<TaskData, TaskAlreadyExistsError>> {
        const task = await prisma.todo.create({
            data: {
                id: uuidv4(),
                title: data.title,
                description: data.description,
                userId: data.userId,
            },
        })

        if (!task) {
            return Err(new TaskAlreadyExistsError(data.title))
        }

        return Ok(task)
    }

    async get(id: string): Promise<storeResult<TaskData, TaskNotFoundError>> {
        const task = await prisma.todo.findUnique({
            where: { id: id },
        })

        if (!task) {
            return Err(new TaskNotFoundError(id))
        }

        return Ok(task)
    }

    async update(data: updateData): Promise<storeResult<TaskData, TaskNotFoundError>> {
        const task = await prisma.todo.update({
            where: { id: data.id },
            data: {
                title: data.title,
                description: data.description,
                completed: data.completed,
            },
        })

        if (!task) {
            return Err(new TaskNotFoundError(data.id))
        }

        return Ok(task)
    }

    async delete(id: string): Promise<storeResult<TaskData, TaskNotFoundError>> {
        const task = await prisma.todo.delete({
            where: { id: id },
        })

        if (!task) {
            return Err(new TaskNotFoundError(id))
        }

        return Ok(task)
    }

    async getAllUserTasks(userId: string, page: number): Promise<storeResult<TaskData[], TaskNotFoundError>> {
        const tasks = await prisma.todo.findMany({
            take: 10,
            skip: (page - 1) * 10,
            where: { userId: userId },
            orderBy: { createdAt: 'desc' },
        })

        if (!tasks) {
            return Err(new TaskNotFoundError(userId))
        }

        return Ok(tasks)
    }
}

const taskModel :Task = new PrismaTask()

export {taskModel, Task}