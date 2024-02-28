import { BaseDto, DtoValidationResult } from "@carbonteq/hexapp";
import { z } from "zod";

export class NewTodoDto extends BaseDto {
    private static readonly schema = z.object({
        userId: z.string().min(36),
        title: z.string().min(1),
        description: z.string(),
    });

    constructor(readonly userId: string, readonly title: string, readonly description: string) {
        super();
    }

    static create(data: unknown): DtoValidationResult<NewTodoDto> {
        return BaseDto.validate<{userId: string, title: string, description: string}>(NewTodoDto.schema, data).map(({ userId, title, description }) => new NewTodoDto(userId, title, description));
    }

    serialize() {
        return {
            userId: this.userId,
            title: this.title,
            description: this.description,
        }
    }
}

export class FetchTodoDto extends BaseDto {
    private static readonly schema = z.object({
        id: z.string().min(36),
        userId: z.string().min(36),
    });

    constructor(readonly id: string, readonly userId: string) {
        super();
    }

    static create(data: unknown): DtoValidationResult<FetchTodoDto> {
        return BaseDto.validate<{id: string, userId: string}>(FetchTodoDto.schema, data).map(({ id, userId }) => new FetchTodoDto(id, userId));
    }
}

export class UpdateTodoDto extends BaseDto {
    private static readonly schema = z.object({
        userId: z.string().min(36),
        id: z.string().min(36),
        title: z.string().optional(),
        description: z.string().optional(),
        completed: z.boolean().optional(), 
    });

    constructor(readonly userId: string, readonly id: string, readonly title?: string, readonly description?: string, readonly completed?: boolean) {
        super();
    }

    static create(data: unknown): DtoValidationResult<UpdateTodoDto> {
        return BaseDto.validate<{userId: string, id: string, title?: string, description?: string, completed?: boolean}>(UpdateTodoDto.schema, data).map(({ userId, id, title, description, completed }) => new UpdateTodoDto(userId, id, title, description, completed));
    }

    serialize() {
        return {
            userId: this.userId,
            id: this.id,
            title: this.title,
            description: this.description,
            completed: this.completed,
        }
    }
}

export class FetchAllUserTodoDto extends BaseDto {
    private static readonly schema = z.object({
        userId: z.string().min(36),
        page: z.number().optional(),
    });

    constructor(readonly userId: string, readonly page?: number) {
        super();
    }

    static create(data: unknown): DtoValidationResult<FetchAllUserTodoDto> {
        return BaseDto.validate<{userId: string, page?: number}>(FetchAllUserTodoDto.schema, data).map(({ userId, page }) => new FetchAllUserTodoDto(userId, page));
    }
}