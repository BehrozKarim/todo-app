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
            userId: req.userId,
        },
    }).then((task) => {
        res.json({message: "Task Created Successfully", task: task})
    }).catch((err) => {
        res.json({message: err.message})
    })
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

async function updateTask(req: any, res: any) {
    let current_task = await prisma.todo.findUnique({
        where: { id: req.params.id},
    })
    
    const task = await prisma.todo.update({
        where: { id: req.params.id},
        data: {
            // if title and description exist in req.body, then update, otherwise don't
            title: req.body.title ? req.body.title : current_task?.title,
            description: req.body.description ? req.body.description : current_task?.description,
            completed: req.body.completed ? req.body.completed : current_task?.completed,
        },
    })
    res.json(task)
}

async function deleteTask(req: any, res: any) {
    const task = await prisma.todo.delete({
        where: { id: req.params.id},
    })
    res.json(task)
}


export { addTask, getTask, getAllUserTasks, updateTask, deleteTask }