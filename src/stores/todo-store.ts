import { PrismaClient } from '@prisma/client'
import {v4 as uuidv4} from 'uuid'
const prisma = new PrismaClient()

type TaskCreationData = {
    title: string,
    description: string,
    userId: string,
}

type updateData = {
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

interface Task {
    create: (data: TaskCreationData) => Promise<TaskData | null>,
    get: (id: string) => Promise<TaskData | null>,
    update: (id: string, data: updateData) => Promise<TaskData | null>,
    delete: (id: string) => Promise<TaskData | null>,
    getAllUserTasks: (userId: string, page: number) => Promise<TaskData[] | null>,
}

class PrismaTask implements Task{
    async create(data: TaskCreationData): Promise<TaskData | null> {
        const task = await prisma.todo.create({
            data: {
                id: uuidv4(),
                title: data.title,
                description: data.description,
                userId: data.userId,
            },
        }).catch((err) => {
            console.log(err)
            return null
        })
        return task
    }

    async get(id: string): Promise<TaskData | null> {
        const task = await prisma.todo.findUnique({
            where: { id: id },
        }).catch((err) => {
            console.log(err)
            return null
        })
        return task
    }

    async update(id: string, data: updateData): Promise<TaskData | null> {
        const currentTask = await prisma.todo.findUnique({
            where: { id: id },
        }).catch((err) => {
            console.log(err)
            return null
        }
        )
        if (!currentTask) {
            return null
        }

        let title = data.title ? data.title : currentTask.title
        let description = data.description ? data.description : currentTask.description
        let completed = data.completed ? data.completed : currentTask.completed

        const task = await prisma.todo.update({
            where: { id: id },
            data: {
                title: title,
                description: description,
                completed: completed,
            },
        }).catch((err) => {
            console.log(err)
            return null
        }
        )
        return task
    }

    async delete(id: string): Promise<TaskData | null> {
        const task = await prisma.todo.delete({
            where: { id: id },
        }).catch((err) => {
            console.log(err)
            return null
        }
        )
        return task
    }

    async getAllUserTasks(userId: string, page: number): Promise<TaskData[] | null> {
        const tasks = await prisma.todo.findMany({
            take: 10,
            skip: (page - 1) * 10,
            where: { userId: userId },
            orderBy: { createdAt: 'desc' },
        }).catch((err) => {
            console.log(err)
            return null
        }
        )
        return tasks
    }
}

const taskModel = new PrismaTask()

export default taskModel