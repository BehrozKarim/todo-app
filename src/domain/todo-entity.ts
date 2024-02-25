import {Result} from 'oxide.ts'
import { TaskNotFoundError, TaskAlreadyExistsError, TaskInvalidOperationError } from './todo-entity-exceptions'
import {BaseEntity, DateTime, IEntity, SerializedEntity} from "@carbonteq/hexapp"

export interface ITask extends IEntity {
    title: string,
    description: string,
    completed: boolean,
    userId: string,
}

export interface SerializedTaskEntity extends SerializedEntity {
    title: string,
    description: string,
    completed: boolean,
    userId: string,
    updatedAt: DateTime
}

export class TaskEntity extends BaseEntity implements ITask{
    private _title: string
    private _description: string
    private _completed: boolean
    private _userId: string

    private constructor(title: string, description: string, completed: boolean, userId: string) {
        super()
        this._title = title
        this._description = description
        this._completed = completed
        this._userId = userId
    }

    get title() {
        return this._title
    }

    get description() {
        return this._description
    }

    get completed() {
        return this._completed
    }

    get userId() {
        return this._userId
    }

    static create(data: TaskCreationData): TaskEntity {
        return new TaskEntity(data.title, data.description, false, data.userId)
    }

    fromSerialized(other: SerializedTaskEntity): void {
        super._fromSerialized(other)
        this._title = other.title
        this._description = other.description
        this._completed = other.completed
        this._userId = other.userId
    }

    serialize() {
        return {
            ...super._serialize(),
            title: this._title,
            description: this._description,
            completed: this._completed,
            userId: this._userId,
        }
    }
}




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