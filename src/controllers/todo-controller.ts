import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
import  taskModel  from '../stores/todo-store'
import { idSchema, todoSchema, updateTodoSchema } from '../validators/zod-schemas'

dotenv.config()

interface customRequest extends Request {
    userId?: string
}
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
    if (!req.query.page || parseInt(req.query.page as string) < 1) {
        req.query.page = "1"
    }
    const tasks = await taskModel.getAllUserTasks(req.userId, parseInt(req.query.page as string))
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