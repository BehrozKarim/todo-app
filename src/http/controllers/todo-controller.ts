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
    private service: TaskServiceInterface
    constructor(service: TaskServiceInterface) {
        this.service = service
    }

    async createTask(req: customRequest, res: Response) {
        if (req.userId){
            const response = await this.service.create(req.body, req.userId)
            res.status(response.status).json(response)
        }
        else {
            res.status(400).json("Invalid Request")
        }
    }

    async getTask(req: customRequest, res: Response) {
        if (req.userId){
            const response = await this.service.get(req.params.id, req.userId)
            res.status(response.status).json(response)
        }
        else {
            res.status(400).json("Invalid Request")
        }

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
        if (req.userId){
            const response = await this.service.getAllUserTasks(req.userId, Number(req.query.page))
            res.json(response)
        }
    }

    async deleteTask(req: customRequest, res: Response) {
        if (req.userId){
            const response = await this.service.delete(req.params.id, req.userId)
            res.status(response.status).json(response)
        }
        else {
            res.status(400).json("Invalid Request")
        }
    }
    
}

const controller : TodoControllerInterface = new TodoController(taskService)
export default controller