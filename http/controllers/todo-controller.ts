import { Request, Response } from 'express'
import { TaskService, TaskServiceInterface } from '../../src/app/services/todo-service'
import { FetchTodoDto, FetchAllUserTodoDto, NewTodoDto, UpdateTodoDto } from '../../src/app/dto/todo.dto'
import { injectable, inject, container } from 'tsyringe'
import { HttpResponse } from '../../shared/shared'

interface customRequest extends Request {
    userId?: string
}

interface TodoControllerInterface {
    createTask: (req: customRequest, res: Response) => Promise<void>
    updateTask: (req: customRequest, res: Response) => Promise<void>
    getTask: (req: customRequest, res: Response) => Promise<void>
    getAllUserTasks: (req: customRequest, res: Response) => Promise<void>
    deleteTask: (req: customRequest, res: Response) => Promise<void>
}

container.register<TaskServiceInterface>("TaskServiceInterface", { useClass: TaskService })
@injectable()
class TodoController {
    constructor(@inject("TaskServiceInterface") private readonly service: TaskServiceInterface) {}

    createTask = async (req: customRequest, res: Response) => {
        if (req.body.userId){
            const dto = NewTodoDto.create(req.body)
            if (dto.isErr()) {
                res.status(400).json(dto.unwrapErr())
                return
            }
            const result = await this.service.create(dto.unwrap())
            const response = HttpResponse.fromAppResult(result)
            res.status(response.status).json(response.data)

        }
        else {
            res.status(400).json("Invalid Request")
        }
    }

    getTask = async (req: customRequest, res: Response) => {
        if (req.body.userId){
            const dto = FetchTodoDto.create({id: req.params.id, userId: req.body.userId})
            if (dto.isErr()) {
                res.status(400).json(dto.unwrapErr())
                return
            }
            const result = await this.service.get(dto.unwrap())
            const response = HttpResponse.fromAppResult(result)
            res.status(response.status).json(response.data)

        }
        else {
            res.status(400).json("Invalid Request")
        }
    }

    updateTask = async (req: customRequest, res: Response) => {
        if (!req.body.userId) {
            res.status(401).json({message: "Unauthorized"})
            return
        }
        const dto = UpdateTodoDto.create({...req.body, id: req.params.id})
        if (dto.isErr()) {
            res.status(400).json(dto.unwrapErr())
            return
        }
        const result = await this.service.update(dto.unwrap())
        const response = HttpResponse.fromAppResult(result)
        res.status(response.status).json(response.data)

    }

    getAllUserTasks = async (req: customRequest, res: Response) => {
        if (req.body.userId){
            const dto = FetchAllUserTodoDto.create({userId: req.body.userId, page: Number(req.query.page)})
            if (dto.isErr()) {
                res.status(400).json(dto.unwrapErr())
                return
            }
            const result = await this.service.getAllUserTasks(dto.unwrap())
            const response = HttpResponse.fromAppResult(result)
            res.status(response.status).json(response.data)

        }
    }

    deleteTask = async (req: customRequest, res: Response) => {
        if (req.body.userId){
            const dto = FetchTodoDto.create({id: req.params.id, userId: req.body.userId})
            if (dto.isErr()) {
                res.status(400).json(dto.unwrapErr())
                return
            }
            const result = await this.service.delete(dto.unwrap())
            const response = HttpResponse.fromAppResult(result)
            res.status(response.status).json(response.data)

        }
        else {
            res.status(400).json("Invalid Request")
        }
    }
    
}

const controller : TodoControllerInterface = container.resolve(TodoController)
export default controller