import {Result} from 'oxide.ts'
import { TaskNotFoundError, TaskAlreadyExistsError, TaskInvalidOperationError } from './todo-store-errors'

type TaskCreationData = {
    title: string,
    description: string,
    userId: string,
}

type updateData = {
    id: string,
    title?: string,
    description?: string,
    completed?: boolean,
}

type TaskData = {
    id: string,
    title: string,
    description: string,
    completed: boolean,
    userId: string,
    createdAt: Date,
    updatedAt: Date,
}

type storeResult <T, E = TaskInvalidOperationError> = Result<
    T,
    E | TaskInvalidOperationError
>

interface Task {
    create: (data: TaskCreationData) => Promise<storeResult<TaskData, TaskAlreadyExistsError>>,
    get: (id: string) => Promise<storeResult<TaskData, TaskNotFoundError>>,
    update: (data: updateData) => Promise<storeResult<TaskData, TaskNotFoundError>>,
    delete: (id: string) => Promise<storeResult<TaskData, TaskNotFoundError>>,
    getAllUserTasks: (userId: string, page: number) => Promise<storeResult<TaskData[], TaskNotFoundError>>,
}

export {Task, TaskData, TaskCreationData, updateData, storeResult}