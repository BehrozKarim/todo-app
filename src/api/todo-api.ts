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

    const task = await prisma.todo.findUnique({
        where: { id: req.params.id},
    }).then((task) => {
        res.json({
            message: "Task Fetched Successfully",
            task: task
        })
    }).catch((err) => {
        res.json({message: err.message})
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

    let current_task = await prisma.todo.findUnique({
        where: { id: req.params.id},
    }).catch((err) => {
        res.json({message: err.message})
    })
    
    await prisma.todo.update({
        where: { id: req.params.id},
        data: {
            title: req.body.title ? req.body.title : current_task?.title,
            description: req.body.description ? req.body.description : current_task?.description,
            completed: req.body.completed ? req.body.completed : current_task?.completed,
        },
    }).then((task) => {
        res.json({message: "Task Updated Successfully", task: task})
    }).catch((err) => {
        res.json({message: err.message})
    })
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

    const task = await prisma.todo.delete({
        where: { id: req.params.id},
    })
    res.json(task)
}


export { addTask, getTask, getAllUserTasks, updateTask, deleteTask }