import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
import  {Task, taskModel}  from '../../domain/stores/todo-store'
import { taskService, TaskServiceInterface } from '../../domain/services/todo-service'
dotenv.config()

interface customRequest extends Request {
    userId?: string
}

interface TodoControllerInterface {
    createTask(req: customRequest, res: Response): Promise<void>
    updateTask(req: customRequest, res: Response): Promise<void>
    getTask(req: customRequest, res: Response): Promise<void>
    getAllUserTasks(req: customRequest, res: Response): Promise<void>
    deleteTask(req: customRequest, res: Response): Promise<void>
}

class TodoController {
    private model: Task
    private service: TaskServiceInterface
    constructor(model: Task, service: TaskServiceInterface) {
        this.model = model
        this.service = service
    }

    async createTask(req: customRequest, res: Response) {
        if (!req.userId) {
            res.status(401).json({message: "Unauthorized"})
            return
        }

        const data = {
            title: req.body.title,
            description: req.body.description,
            userId: req.userId,
        }

        const task = await this.model.create(data)
        if (!task) {
            res.status(500).json({message: "Internal Server Error"})
            return
        }
        res.json({message: "Task Created Successfully", task: task})
    }

    async getTask(req: customRequest, res: Response) {
        const task = await this.model.get(req.params.id)
        if (!task) {
            res.status(404).json({message: "Task not found"})
            return
        }
        res.json({message: "Task Fetched Successfully", task: task})

    }

    async updateTask(req: customRequest, res: Response) {
        if (!req.userId) {
            res.status(401).json({message: "Unauthorized"})
            return
        }
        const response = await this.service.update(req.body, req.params.id, req.userId)
        res.status(response.status).json(response)
    }

    async getAllUserTasks(req: customRequest, res: Response) {
        if (!req.userId) {
            res.status(401).json({message: "Unauthorized"})
            return
        }

        const tasks = await this.model.getAllUserTasks(req.userId, parseInt(req.query.page as string))
        if (!tasks) {
            res.status(500).json({message: "Internal Server Error"})
            return
        }
        res.json({message: "Tasks Fetched Successfully", tasks: tasks})
    }

    async deleteTask(req: customRequest, res: Response) {
        const task = await this.model.delete(req.params.id)
        if (!task) {
            res.status(404).json({message: "Unable to delete the task"})
            return
        }
        res.json({message: "Task Deleted Successfully", task: task})
    }
    
}

// export { TodoController, TodoControllerInterface }

const controller : TodoControllerInterface = new TodoController(taskModel, taskService)
export default controller