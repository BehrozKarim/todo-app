import { AlreadyExistsError, NotFoundError, InvalidOperation } from '@carbonteq/hexapp';

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

export class TaskInvalidOperationError extends InvalidOperation {
    constructor(message: string) {
        super(message);
    }
}
