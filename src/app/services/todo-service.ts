import { mailService } from "../../infra/mail-service"
import { mailData } from "../../utils/utils"
import { TodoRepository } from "../../domain/todo-repository"
import { UUIDVo, AppError } from "@carbonteq/hexapp"
import { TaskEntity, SerializedTaskEntity } from "../../domain/todo-entity"
import { TodoDbRepo } from "../../infra/stores/todo-db-repo"
import { FetchTodoDto, NewTodoDto, UpdateTodoDto, FetchAllUserTodoDto } from "../dto/todo.dto"
import { AppResult } from "@carbonteq/hexapp"

interface TaskServiceInterface {
    get: (data: FetchTodoDto) => Promise<AppResult<SerializedTaskEntity>>,
    getAllUserTasks: (data: FetchAllUserTodoDto) => Promise<AppResult<SerializedTaskEntity[]>>,
    create: (data: NewTodoDto) => Promise<AppResult<SerializedTaskEntity>>,
    delete: (data: FetchTodoDto) => Promise<AppResult<SerializedTaskEntity>>,
    update: (data: UpdateTodoDto) => Promise<AppResult<SerializedTaskEntity>>,
}

export class TaskService implements TaskServiceInterface{
    constructor(private readonly model: TodoRepository) {}

    async get(data: FetchTodoDto): Promise<AppResult<SerializedTaskEntity>> {
        const taskIdVo = (UUIDVo.fromStr(data.id)).unwrap()
        const task = await this.model.fetchById(taskIdVo)
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
        const result = await this.model.insert(task)
        if (result.isErr()) {
            return AppResult.Err(result.unwrapErr())
        }
        return AppResult.fromResult(result.map((task) => task.serialize()));
    }

    async update(data: UpdateTodoDto): Promise<AppResult<SerializedTaskEntity>> {
        const taskIdVo = (UUIDVo.fromStr(data.id)).unwrap()
        const currentTask = await this.model.fetchById(taskIdVo)
        if (currentTask.isErr()) {
            return AppResult.Err(currentTask.unwrapErr())
        }
        if (currentTask.unwrap().userId !== data.userId) {
            return AppResult.Err(AppError.Unauthorized("Unauthorized: User does not own this task"))
        }
        const task = currentTask.unwrap()
        task.update(data.serialize())
        const result = await this.model.update(task)
        if (result.isErr()) {
            return AppResult.Err(result.unwrapErr())
        }
        return AppResult.fromResult(result.map((task) => task.serialize()));
    }

    async delete(data: FetchTodoDto): Promise<AppResult<SerializedTaskEntity>> {
        const taskIdVo = (UUIDVo.fromStr(data.id)).unwrap()
        const task = await this.model.fetchById(taskIdVo)
        if (task.isErr()) {
            return AppResult.Err(task.unwrapErr())
        }
        if (task.unwrap().userId !== data.userId) {
            return AppResult.Err(AppError.Unauthorized("Unauthorized: User does not own this task"))
        }
        const result = await this.model.deleteById(taskIdVo)
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
        const tasks = await this.model.fetchByUserId(data.userId, data.page??1)
        if (tasks.isErr()) {
            return AppResult.Err(tasks.unwrapErr())
        }
        const unwrappedTasks = tasks.unwrap()
        const res = unwrappedTasks.map((task) => task.serialize());

        return AppResult.Ok(res);
    }

}

const taskService = new TaskService(new TodoDbRepo())
export { taskService, TaskServiceInterface }