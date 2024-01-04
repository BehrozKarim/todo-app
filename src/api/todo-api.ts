import { PrismaClient } from '@prisma/client'
import * as jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'
import exp from 'constants'
dotenv.config()

const prisma = new PrismaClient()

async function addTask(req: any, res: any) {
    const task = await prisma.todo.create({
        data: {
            title: req.body.title,
            description: req.body.description,
            userId: req.body.userId,
        },
    })
    res.json(task)
}

async function getTask(req: any, res: any) {
    const task = await prisma.todo.findUnique({
        where: { id: req.params.id},
    })
    res.json(task)
}

async function getAllUserTasks(req: any, res: any) {
    const tasks = await prisma.todo.findMany({
        where: { userId: req.params.id},
    })
    res.json(tasks)
}

export { addTask, getTask, getAllUserTasks }