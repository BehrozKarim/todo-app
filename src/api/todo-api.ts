import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()
const prisma = new PrismaClient()
const todoSchema = z.object({
    title: z.string().min(3),
    description: z.string().min(3),
})

async function addTask(req: any, res: any) {
    const result = todoSchema.safeParse(req.body)
    if (!result.success) {
        res.status(400).json(result.error)
        return
    }

    await prisma.todo.create({
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

const idSchema = z.object({
    id: z.string().min(36),
})

async function getTask(req: any, res: any) {
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

const updateTodoSchema = z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(3).optional(),
    completed: z.boolean().optional(),
})

async function updateTask(req: any, res: any) {
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

async function getAllUserTasks(req: any, res: any) {
    const tasks = await prisma.todo.findMany({
        where: { userId: req.userId},
    }).then((tasks) => {
        res.json(tasks)
    }
    ).catch((err) => {
        res.json({message: err.message})
    })
}

async function deleteTask(req: any, res: any) {
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