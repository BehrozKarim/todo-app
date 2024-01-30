class StoreError extends Error {
    protected constructor(message: string) {
        super();
        this.name = this.constructor.name;
        this.message = message;
    }
}

export class GenericStoreError extends StoreError {}

export class NotFoundError extends StoreError {}

export class AlreadyExistsError extends StoreError {}

export class RelationNotFoundError extends NotFoundError {
    constructor (
        childEntity: string,
        parentEntity: string,
        childId: string,
        parentId: string,
    ) {
        super(`Relation ${childEntity} with id ${childId} not found in ${parentEntity} with id ${parentId}`);
        }
}

export class UnauthorizedOperationError extends StoreError {}

export class InvalidOperationError extends StoreError {}

export class ValidationError extends StoreError {}

export class FieldValidationError extends ValidationError {
    constructor (field: string, value: string, message = "")
    {
        super(`Invalid value '${value}' for field '${field}'. ${message}`);
    }
}

export class NotImplementedError extends StoreError {}

export class ExternalServiceFailureError extends StoreError {}

export type storeErr = 
    | GenericStoreError
    | NotFoundError
    | AlreadyExistsError
    | RelationNotFoundError
    | UnauthorizedOperationError
    | ValidationError
    | FieldValidationError
    | NotImplementedError
    | ExternalServiceFailureError;


