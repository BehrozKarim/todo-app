import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import { z } from 'zod'
import { Request, Response } from 'express'
import {v4 as uuidv4} from 'uuid'


dotenv.config()
const prisma = new PrismaClient()

interface customRequest extends Request {
    userId?: string
}

// Zod Schemas
const todoSchema = z.object({
    title: z.string().min(3),
    description: z.string().min(3),
})

const idSchema = z.object({
    id: z.string().min(36),
})

const updateTodoSchema = z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(3).optional(),
    completed: z.boolean().optional(),
})

// COntroller Functions

async function addTask(req: customRequest, res: Response) {
    const result = todoSchema.safeParse(req.body)
    if (!result.success) {
        res.status(400).json(result.error)
        return
    }

    if (!req.userId) {
        res.status(401).json({message: "Unauthorized"})
        return
    }

    await prisma.todo.create({
        data: {
            id: uuidv4(),
            title: req.body.title,
            description: req.body.description,
            userId: req.userId,
        },
    }).then((task) => {
        res.json({message: "Task Created Successfully", task: task})
    }).catch((err) => {
        res.json({message: err})
    })
}

async function getTask(req: customRequest, res: Response) {
    const result = idSchema.safeParse(req.params)
    if (!result.success) {
        res.status(400).json(result.error)
        return
    }

    await prisma.todo.findUnique({
        where: { id: req.params.id, userId: req.userId},
    }).then((task) => {
        if (!task) {
            res.status(404).json({message: "Task not found"})
            return
        }
        res.json({
            message: "Task Fetched Successfully",
            task: task
        })
    }).catch((err) => {
        res.json({message: err})
    })

}

async function updateTask(req: customRequest, res: Response) {
    const result = updateTodoSchema.safeParse(req.body)
    if (!result.success) {
        res.status(400).json(result.error)
        return
    }

    const idCheck = idSchema.safeParse(req.params)
    if (!idCheck.success) {
        res.status(400).json(idCheck.error)
        return
    }

    let currentTask = await prisma.todo.findUnique({
        where: { id: req.params.id, userId: req.userId},
    }).catch((err) => {
        res.json({message: err.message})
    })
    
    if (!currentTask) {
        res.status(404).json({message: "Task not found"})
        return
    }

    currentTask.completed = req.body.completed ? req.body.completed : currentTask.completed
    currentTask.title = req.body.title ? req.body.title : currentTask.title
    currentTask.description = req.body.description ? req.body.description : currentTask.description
    currentTask.updatedAt = new Date()
    currentTask = await prisma.todo.update({
        where: { id: req.params.id, },
        data: currentTask,
    }).catch((err) => {
        res.json({message: err.message})
    })

    res.json({message: "Task Updated Successfully", task: currentTask})
}

async function getAllUserTasks(req: customRequest, res: Response) {
    const tasks = await prisma.todo.findMany({
        where: { userId: req.userId},
    }).then((tasks) => {
        res.json(tasks)
    }
    ).catch((err) => {
        res.json({message: err.message})
    })
}

async function deleteTask(req: customRequest, res: Response) {
    const result = idSchema.safeParse(req.params)
    if (!result.success) {
        res.status(400).json(result.error)
        return
    }

    await prisma.todo.delete({
        where: { id: req.params.id, userId: req.userId},
    }).then((task) => {
        res.json({message: "Task Deleted Successfully", task: task})
    }).catch((err) => {
        res.json({message: err})
    })
}


export { addTask, getTask, getAllUserTasks, updateTask, deleteTask }