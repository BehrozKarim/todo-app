import { NotFoundError, AlreadyExistsError, InvalidOperationError } from "./store-errors";

export class TaskNotFoundError extends NotFoundError {
    constructor(id: string) {
        super(`Task with id ${id} not found`);
    }
}

export class TaskAlreadyExistsError extends AlreadyExistsError {
    constructor(id: string) {
        super(`Task with id ${id} already exists`);
    }
}

export class TaskInvalidOperationError extends InvalidOperationError {
    constructor(message: string) {
        super(message);
    }
}