import {taskModel, Task} from "../stores/todo-store"

type TaskUpdateData = {
    title?: string,
    description?: string,
    completed?: boolean,
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
    update: (taskData: TaskUpdateData, taskId: string, userId: string) => Promise<ReturnTaskData | errorData>
}

class TaskService implements TaskServiceInterface{
    private model: Task
    constructor(model: Task) {
        this.model = model
    }

    async update(taskData: TaskUpdateData, taskId: string, userId: string) :Promise<ReturnTaskData | errorData>{
        const currentTask = await this.model.get(taskId)
        if (!currentTask) {
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

        const task = await this.model.update(data)
        if (!task) {
            return {
                message: "Unable to update the task",
                status: 500,
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
}

const taskService = new TaskService(taskModel)
export { taskService, TaskServiceInterface }