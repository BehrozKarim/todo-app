import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import { date, z } from 'zod'
import { Request, Response } from 'express'
import {v4 as uuidv4} from 'uuid'
import  taskModel  from '../services/todo-services'


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

// Controller Functions

async function createTask(req: customRequest, res: Response) {
    const result = todoSchema.safeParse(req.body)
    if (!result.success) {
        res.status(400).json(result.error)
        return
    }

    if (!req.userId) {
        res.status(401).json({message: "Unauthorized"})
        return
    }

    const data = {
        title: req.body.title,
        description: req.body.description,
        userId: req.userId,
    }

    const task = await taskModel.create(data)
    if (!task) {
        res.status(500).json({message: "Internal Server Error"})
        return
    }
    res.json({message: "Task Created Successfully", task: task})
}

async function getTask(req: customRequest, res: Response) {
    const result = idSchema.safeParse(req.params)
    if (!result.success) {
        res.status(400).json(result.error)
        return
    }

    const task = await taskModel.get(req.params.id)
    if (!task) {
        res.status(404).json({message: "Task not found"})
        return
    }
    res.json({message: "Task Fetched Successfully", task: task})

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

    const task = await taskModel.update(req.params.id, req.body)
    if (!task) {
        res.status(404).json({message: "Unable to update the task"})
        return
    }
    res.json({message: "Task Updated Successfully", task: task})


}

async function getAllUserTasks(req: customRequest, res: Response) {
    if (!req.userId) {
        res.status(401).json({message: "Unauthorized"})
        return
    }
    const tasks = await taskModel.getAllUserTasks(req.userId)
    if (!tasks) {
        res.status(500).json({message: "Internal Server Error"})
        return
    }
    res.json({message: "Tasks Fetched Successfully", tasks: tasks})
}

async function deleteTask(req: customRequest, res: Response) {
    const result = idSchema.safeParse(req.params)
    if (!result.success) {
        res.status(400).json(result.error)
        return
    }

    const task = await taskModel.delete(req.params.id)
    if (!task) {
        res.status(404).json({message: "Unable to delete the task"})
        return
    }

    res.json({message: "Task Deleted Successfully", task: task})
}

export { createTask, getTask, getAllUserTasks, updateTask, deleteTask }