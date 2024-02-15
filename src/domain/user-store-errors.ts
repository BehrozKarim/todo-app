import { NotFoundError, AlreadyExistsError, InvalidOperationError } from "./store-errors";

export class UserNotFoundError extends NotFoundError {
    constructor(idOrUsernameOrEmail: string, type: 'id' | 'username' | 'email') {
        super(`User with ${type} ${idOrUsernameOrEmail} not found`);
    }
}

export class UserAlreadyExistsError extends AlreadyExistsError {
    constructor(usernameOrEmail: string, type: 'username' | 'email') {
        super(`User with ${type} ${usernameOrEmail} already exists`);
    }
}

export class UserInvalidOperationError extends InvalidOperationError {
    constructor(message: string) {
        super(message);
    }
}