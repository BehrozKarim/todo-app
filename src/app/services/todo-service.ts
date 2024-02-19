import { sendEmail } from "../../infra/mail-service"
import { mailData } from "../../utils/utils"
import { TodoRepository } from "../../domain/todo-repository"
import { UUIDVo } from "@carbonteq/hexapp"
import { TaskEntity, ITask } from "../../domain/todo-entity"
import { TodoDbRepo } from "../../infra/stores/todo-db-repo"

type TaskUpdateData = {
    title?: string,
    description?: string,
    completed?: boolean,
}

type TaskCreationData = {
    title: string,
    description?: string,
}

type ReturnTaskData = {
    message: string,
    id: string,
    title: string,
    description: string,
    completed: boolean,
    userId: string,
    createdAt: Date,
    updatedAt: Date,
    status: number
}

type errorData = {
    message: string,
    status: number,
}

interface TaskServiceInterface {
    get: (taskId: string, userId: string) => Promise<ReturnTaskData | errorData>,
    getAllUserTasks: (userId: string, page: number) => Promise<ReturnTaskData[] | errorData>,
    create: (taskData: TaskCreationData, userId: string) => Promise<ReturnTaskData | errorData>,
    delete: (taskId: string, userId: string) => Promise<ReturnTaskData | errorData>,
    update: (taskData: TaskUpdateData, taskId: string, userId: string) => Promise<ReturnTaskData | errorData>
}

export class TaskService implements TaskServiceInterface{
    private model: TodoRepository
    constructor(model: TodoRepository) {
        this.model = model
    }

    async get(taskId: string, userId: string): Promise<ReturnTaskData | errorData> {
        const taskIdVo = (UUIDVo.fromStr(taskId)).unwrap()
        const taskEnt = await this.model.fetchById(taskIdVo)
        
        if (taskEnt.isErr()) {
            return {
                message: taskEnt.unwrapErr().message,
                status: 404,
            }
        }

        const task = taskEnt.unwrap()
        if (task.userId !== userId) {
            return {
                message: "Unauthorized",
                status: 401,
            }
        }
        
        return {
            message: "Task Fetched Successfully",
            id: task.Id.serialize(),
            title: task.title,
            description: task.description,
            completed: task.completed,
            userId: task.userId,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
            status: 200,
        }
    }

    async getAllUserTasks(userId: string, page: number): Promise<ReturnTaskData[] | errorData> {
        const tasksEnts = await this.model.fetchByUserId(userId, page)
        if (tasksEnts.isErr()) {
            return {
                message: tasksEnts.unwrapErr().message,
                status: 404,
            }
        }
        const tasks = tasksEnts.unwrap()
        return tasks.map((task) => {
            return {
                message: "Task Fetched Successfully",
                id: task.Id.serialize(),
                title: task.title,
                description: task.description,
                completed: task.completed,
                userId: task.userId,
                createdAt: task.createdAt,
                updatedAt: task.updatedAt,
                status: 200,
            }
        })
    }

    async create(taskData: TaskCreationData, userId: string): Promise<ReturnTaskData | errorData> {
        const data = {
            title: taskData.title,
            description: taskData.description || "",
            userId: userId,
        }
        const taskEnt = new TaskEntity(data.title, data.description, false, data.userId)


        const createdTask = await this.model.insert(taskEnt)
        if (createdTask.isErr()) {
            return {
                message: createdTask.unwrapErr().message,
                status: 500,
            }
        }
        const task = createdTask.unwrap()
        return {
            message: "Task Created Successfully",
            id: task.Id.serialize(),
            title: task.title,
            description: task.description,
            completed: task.completed,
            userId: task.userId,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
            status: 200,
        }
    }

    async update(taskData: TaskUpdateData, taskId: string, userId: string) :Promise<ReturnTaskData | errorData>{
        const taskIdVo = (UUIDVo.fromStr(taskId)).unwrap()
        const currentTaskEnt = await this.model.fetchById(taskIdVo)
        if (currentTaskEnt.isErr()) {
            return {
                message: currentTaskEnt.unwrapErr().message,
                status: 404,
            }
        }
        const currentTask = currentTaskEnt.unwrap()
        const data = {
            ...currentTask.serialize(),
            title: taskData.title || currentTask.title,
            description: taskData.description || currentTask.description,
            completed: taskData.completed || currentTask.completed,
        }
        const toUpdate = new TaskEntity(data.title, data.description, data.completed, currentTask.userId)
        toUpdate.fromSerialized(data)
        const updatedEnt= await this.model.update(toUpdate)
        if (updatedEnt.isErr()) {
            return {
                message: updatedEnt.unwrapErr().message,
                status: 404,
            }
        }
        const task = updatedEnt.unwrap()
        return {
            message: "Task Updated Successfully",
            id: task.Id.serialize(),
            title: task.title,
            description: task.description,
            completed: task.completed,
            userId: task.userId,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
            status: 200,
        }
    }

    async delete(taskId: string, userId: string): Promise<ReturnTaskData | errorData> {
        const taskIdVo = (UUIDVo.fromStr(taskId)).unwrap()
        const currentTaskEnt = await this.model.fetchById(taskIdVo)
        if (currentTaskEnt.isErr()) {
            return {
                message: currentTaskEnt.unwrapErr().message,
                status: 404,
            }
        }
        const task = currentTaskEnt.unwrap()
        if (task.userId !== userId) {
            return {
                message: "Unauthorized",
                status: 401,
            }
        }
        const deletedTaskEnt = await this.model.deleteById(taskIdVo)
        if (deletedTaskEnt.isErr()) {
            return {
                message: deletedTaskEnt.unwrapErr().message,
                status: 404,
            }
        }
        const deletedTask = deletedTaskEnt.unwrap()
        const msg :mailData = {
            subject: "Task Deleted",
            data: `Task with id: "${deletedTask.Id.serialize()}" title: "${deletedTask.title}" has been deleted`,
            userId: userId,
        }
        sendEmail(msg)
        return {
            message: "Task Deleted Successfully",
            id: deletedTask.Id.serialize(),
            title: deletedTask.title,
            description: deletedTask.description,
            completed: deletedTask.completed,
            userId: deletedTask.userId,
            createdAt: deletedTask.createdAt,
            updatedAt: deletedTask.updatedAt,
            status: 200,
        }
    }
}

const taskService = new TaskService(new TodoDbRepo())
export { taskService, TaskServiceInterface }