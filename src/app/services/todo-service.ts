import { mailService } from "../../infra/mail-service"
import { mailData } from "../../../shared/shared"
import { TodoRepository } from "../../domain/todo-repository"
import { UUIDVo, AppError, AppResult } from "@carbonteq/hexapp"
import { TaskEntity, SerializedTaskEntity } from "../../domain/todo-entity"
import { TodoDbRepo } from "../../infra/Repos/todo-db-repo"
import { FetchTodoDto, NewTodoDto, UpdateTodoDto, FetchAllUserTodoDto } from "../dto/todo.dto"
import { injectable, inject , container} from "tsyringe"
import { matchRes, Result } from "@carbonteq/fp"

export interface TaskServiceInterface {
    get: (data: FetchTodoDto) => Promise<AppResult<SerializedTaskEntity>>,
    getAllUserTasks: (data: FetchAllUserTodoDto) => Promise<AppResult<SerializedTaskEntity[]>>,
    create: (data: NewTodoDto) => Promise<AppResult<SerializedTaskEntity>>,
    delete: (data: FetchTodoDto) => Promise<AppResult<SerializedTaskEntity>>,
    update: (data: UpdateTodoDto) => Promise<AppResult<SerializedTaskEntity>>,
}

@injectable()
export class TaskService implements TaskServiceInterface{
    constructor(@inject("TodoRepository") private readonly repo: TodoRepository) {}

    async get(data: FetchTodoDto): Promise<AppResult<SerializedTaskEntity>> {
        const taskIdVo = (UUIDVo.fromStr(data.id)).unwrap()
        const task = await this.repo.fetchById(taskIdVo)
        if (task.isErr()) {
            return AppResult.Err(task.unwrapErr())
        }
        if (task.unwrap().userId !== data.userId) {
            return AppResult.Err(AppError.Unauthorized("Unauthorized: User does not own this task"))
        }
        const res = task.map((task) => task.serialize());
        return AppResult.fromResult(res);
    }

    async create(data: NewTodoDto): Promise<AppResult<SerializedTaskEntity>> {
        const task = TaskEntity.create(data.serialize())
        const result = await this.repo.insert(task)
        return matchRes(result, {
            Ok: (task) => AppResult.fromResult(Result.Ok(task.serialize())),
            Err: (err) => AppResult.Err(err)
        })
    }

    async update(data: UpdateTodoDto): Promise<AppResult<SerializedTaskEntity>> {
        const taskIdVo = (UUIDVo.fromStr(data.id)).unwrap()
        const currentTask = await this.repo.fetchById(taskIdVo)
        if (currentTask.isErr()) {
            return AppResult.Err(currentTask.unwrapErr())
        }
        if (currentTask.unwrap().userId !== data.userId) {
            return AppResult.Err(AppError.Unauthorized("Unauthorized: User does not own this task"))
        }
        const task = currentTask.unwrap()
        task.update(data.serialize())
        const result = await this.repo.update(task)
        return matchRes(result, {
            Ok: (task) => AppResult.fromResult(Result.Ok(task.serialize())),
            Err: (err) => AppResult.Err(err)
        })
    }

    async delete(data: FetchTodoDto): Promise<AppResult<SerializedTaskEntity>> {
        const taskIdVo = (UUIDVo.fromStr(data.id)).unwrap()
        const task = await this.repo.fetchById(taskIdVo)
        if (task.isErr()) {
            return AppResult.Err(task.unwrapErr())
        }
        if (task.unwrap().userId !== data.userId) {
            return AppResult.Err(AppError.Unauthorized("Unauthorized: User does not own this task"))
        }
        const result = await this.repo.deleteById(taskIdVo)
        if (result.isErr()) {
            return AppResult.Err(result.unwrapErr())
        }
        const msg :mailData = {
            subject: "Task Deleted",
            data: `Task with id: "${task.unwrap().Id.serialize()}" title: "${task.unwrap().title}" has been deleted`,
            userId: task.unwrap().userId,
        }
        mailService.sendEmail(msg)
        return AppResult.fromResult(result.map((task) => task.serialize()));
    }

    async getAllUserTasks(data: FetchAllUserTodoDto): Promise<AppResult<SerializedTaskEntity[]>> {
        const tasks = await this.repo.fetchByUserId(data.userId, data.page??1)
        return matchRes(tasks, {
            Ok: (tasks) => AppResult.fromResult(Result.Ok(tasks.map((task) => task.serialize()))),
            Err: (err) => AppResult.Err(err)
        })
    }

}