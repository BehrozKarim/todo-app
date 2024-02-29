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

@injectable()
export class TodoController implements TodoControllerInterface{
    constructor(@inject("TaskServiceInterface") private readonly tService: TaskServiceInterface) {}

    createTask = async (req: customRequest, res: Response) => {
        const dto = NewTodoDto.create(req.body)
        const result = await this.tService.create(dto.unwrap())
        const response = HttpResponse.fromAppResult(result)
        res.status(response.status).json(response.data)
    }

    getTask = async (req: customRequest, res: Response) => {
        const dto = FetchTodoDto.create({id: req.params.id, userId: req.body.userId})
        const result = await this.tService.get(dto.unwrap())
        const response = HttpResponse.fromAppResult(result)
        res.status(response.status).json(response.data)
    }

    updateTask = async (req: customRequest, res: Response) => {
        const dto = UpdateTodoDto.create({...req.body, id: req.params.id})
        const result = await this.tService.update(dto.unwrap())
        const response = HttpResponse.fromAppResult(result)
        res.status(response.status).json(response.data)

    }

    getAllUserTasks = async (req: customRequest, res: Response) => {
        const dto = FetchAllUserTodoDto.create({userId: req.body.userId, page: Number(req.query.page)})
        const result = await this.tService.getAllUserTasks(dto.unwrap())
        const response = HttpResponse.fromAppResult(result)
        res.status(response.status).json(response.data)
    }

    deleteTask = async (req: customRequest, res: Response) => {
        const dto = FetchTodoDto.create({id: req.params.id, userId: req.body.userId})
        const result = await this.tService.delete(dto.unwrap())
        const response = HttpResponse.fromAppResult(result)
        res.status(response.status).json(response.data)
    }
    
}