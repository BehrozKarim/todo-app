import { PrismaClient } from '@prisma/client'
import {v4 as uuidv4} from 'uuid'
const prisma = new PrismaClient()

type TaskData = {
    title: string,
    description: string,
    userId: string,
}

type updateData = {
    title?: string,
    description?: string,
    completed?: boolean,
}

export async function createTaskService(data: TaskData) {
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

export async function getTaskService(id: string) {
    const task = await prisma.todo.findUnique({
        where: { id: id },
    }).catch((err) => {
        console.log(err)
        return null
    })
    return task
}

export async function updateTaskService(id: string, data: updateData) {

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

export async function deleteTaskService(id: string) {
    const task = await prisma.todo.delete({
        where: { id: id },
    }).catch((err) => {
        console.log(err)
        return null
    }
    )
    return task
}

export async function getAllUserTasksService(userId: string) {
    const tasks = await prisma.todo.findMany({
        where: { userId: userId },
    }).catch((err) => {
        console.log(err)
        return null
    }
    )
    return tasks
}