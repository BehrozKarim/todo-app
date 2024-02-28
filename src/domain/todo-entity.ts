import {Result} from 'oxide.ts'
import { TaskNotFoundError, TaskAlreadyExistsError, TaskInvalidOperationError } from './todo-entity-exceptions'
import {BaseEntity, DateTime, IEntity, SerializedEntity, UUIDVo} from "@carbonteq/hexapp"

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

type TaskCreationData = {
    title: string,
    description: string,
    userId: string,
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

    update(data: Partial<ITask>): void {
        Object.assign(this, data)
        super.markUpdated()
    }

    static fromSerialized(other: SerializedTaskEntity): TaskEntity {
        const task = new TaskEntity(other.title, other.description, other.completed, other.userId)
        const id = UUIDVo.fromStr(other.Id).unwrap()
        task._copyBaseProps({
            Id: id,
            createdAt: other.createdAt,
            updatedAt: other.updatedAt
        })
        return task
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
