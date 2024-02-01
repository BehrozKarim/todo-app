import {taskModel, Task} from "../../domain/stores/todo-store"

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

class TaskService implements TaskServiceInterface{
    private model: Task
    constructor(model: Task) {
        this.model = model
    }

    async get(taskId: string, userId: string): Promise<ReturnTaskData | errorData> {
        const [err, task] = (await this.model.get(taskId)).intoTuple()
        if (err) {
            return {
                message: err.message,
                status: 404,
            }
        }
        if (task.userId !== userId) {
            return {
                message: "Unauthorized",
                status: 401,
            }
        }
        return {
            message: "Task Fetched Successfully",
            id: task.id,
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
        const [err, tasks] = (await this.model.getAllUserTasks(userId, page)).intoTuple()
        if (err) {
            return {
                message: err.message,
                status: 404,
            }
        }
        return tasks.map((task) => {
            return {
                message: "Task Fetched Successfully",
                id: task.id,
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
            title: taskData.title || "",
            description: taskData.description || "",
            userId: userId,
        }
        const [err, task] = (await this.model.create(data)).intoTuple()
        if (err) {
            return {
                message: err.message,
                status: 400,
            }
        }
        return {
            message: "Task Created Successfully",
            id: task.id,
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
        const [err, currentTask] = (await this.model.get(taskId)).intoTuple()
        if (err) {
            return {
                message: "Task not found",
                status: 404,
            }
        }
        if (currentTask.userId !== userId) {
            return {
                message: "Unauthorized",
                status: 401,
            }
        }
        const data = {
            id: taskId,
            title: taskData.title || currentTask.title,
            description: taskData.description || currentTask.description,
            completed: taskData.completed || currentTask.completed,
        }

        const [updateErr, task] = (await this.model.update(data)).intoTuple()
        if (updateErr) {
            return {
                message: updateErr.message,
                status: 404,
            }
        }
        return {
            message: "Task Updated Successfully",
            id: task.id,
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
        const [err, task] = (await this.model.get(taskId)).intoTuple()
        if (err) {
            return {
                message: err.message,
                status: 404,
            }
        }
        if (task.userId !== userId) {
            return {
                message: "Unauthorized",
                status: 401,
            }
        }
        const [deleteErr, deletedTask] = (await this.model.delete(taskId)).intoTuple()
        if (deleteErr) {
            return {
                message: deleteErr.message,
                status: 404,
            }
        }
        return {
            message: "Task Deleted Successfully",
            id: deletedTask.id,
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

const taskService = new TaskService(taskModel)
export { taskService, TaskServiceInterface }