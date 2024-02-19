import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
import { taskService, TaskServiceInterface } from '../../src/app/services/todo-service'
import { Result } from 'oxide.ts'
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
        if (req.body.userId){
            const result = await Result.safe(this.service.create(req.body, req.body.userId))
            if (result.isErr()) {
                res.status(500).json(result.unwrapErr())
                return
            }
            const response = result.unwrap()
            res.status(response.status).json(response)
        }
        else {
            res.status(400).json("Invalid Request")
        }
    }

    async getTask(req: customRequest, res: Response) {
        if (req.body.userId){
            const result = await Result.safe(this.service.get(req.params.id, req.body.userId))
            if (result.isErr()) {
                res.status(500).json(result.unwrapErr())
                return
            }
            const response = result.unwrap()
            res.status(response.status).json(response)
        }
        else {
            res.status(400).json("Invalid Request")
        }

    }

    async updateTask(req: customRequest, res: Response) {
        if (!req.body.userId) {
            res.status(401).json({message: "Unauthorized"})
            return
        }
        const result = await Result.safe(this.service.update(req.body, req.params.id, req.body.userId))
        if (result.isErr()) {
            res.status(500).json(result.unwrapErr())
            return
        }
        const response = result.unwrap()
        res.status(response.status).json(response)
    }

    async getAllUserTasks(req: customRequest, res: Response) {
        if (req.body.userId){
            const result = await Result.safe(this.service.getAllUserTasks(req.body.userId, Number(req.query.page)))
            if (result.isErr()) {
                res.status(500).json(result.unwrapErr())
                return
            }
            const response = result.unwrap()
            res.json(response)
        }
    }

    async deleteTask(req: customRequest, res: Response) {
        if (req.body.userId){
            const result = await Result.safe(this.service.delete(req.params.id, req.body.userId))
            if (result.isErr()) {
                res.status(500).json(result.unwrapErr())
                return
            }
            const response = result.unwrap()
            res.status(response.status).json(response)
        }
        else {
            res.status(400).json("Invalid Request")
        }
    }
    
}

const controller : TodoControllerInterface = new TodoController(taskService)
export default controller