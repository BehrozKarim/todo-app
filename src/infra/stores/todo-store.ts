import { PrismaClient } from '@prisma/client'
import {v4 as uuidv4} from 'uuid'
import { Ok, Err } from 'oxide.ts'
import {Task, TaskCreationData, TaskData, storeResult, updateData} from '../../domain/todo-entities'
import {TaskAlreadyExistsError, TaskNotFoundError} from '../../domain/todo-store-errors'

const prisma = new PrismaClient()

class PrismaTask implements Task{
    async create(data: TaskCreationData): Promise<storeResult<TaskData, TaskAlreadyExistsError>> {
        try {
            const task = await prisma.todo.create({
                data: {
                    id: uuidv4(),
                    title: data.title,
                    description: data.description,
                    userId: data.userId,
                },
            })
            return Ok(task)

        } catch (error) {
            return Err(new TaskAlreadyExistsError(data.title))
        }
    }

    async get(id: string): Promise<storeResult<TaskData, TaskNotFoundError>> {
        try {
            const task = await prisma.todo.findUnique({
                where: { id: id },
            })

            if (!task) {
                return Err(new TaskNotFoundError(id))
            }

            return Ok(task)
        } catch (error) {
            return Err(new TaskNotFoundError(id))
        }
    }

    async update(data: updateData): Promise<storeResult<TaskData, TaskNotFoundError>> {
        try {
            const task = await prisma.todo.update({
                where: { id: data.id },
                data: {
                    title: data.title,
                    description: data.description,
                    completed: data.completed,
                },
            })
            return Ok(task)

        } catch (error) {
            return Err(new TaskNotFoundError(data.id))
        }
    }

    async delete(id: string): Promise<storeResult<TaskData, TaskNotFoundError>> {
        try {
            const task = await prisma.todo.delete({
                where: { id: id },
            })
            return Ok(task)

        } catch (error) {
            return Err(new TaskNotFoundError(id))
        }
    }

    async getAllUserTasks(userId: string, page: number): Promise<storeResult<TaskData[], TaskNotFoundError>> {
        try {
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
            
        } catch (error) {
            return Err(new TaskNotFoundError(userId))
        }
    }
}

const taskModel :Task = new PrismaTask()

export {taskModel, Task}