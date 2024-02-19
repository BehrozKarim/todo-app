import { BaseDto, DtoValidationResult } from "@carbonteq/hexapp";
import { z } from "zod";

export class NewTodoDto extends BaseDto {
    private static readonly schema = z.object({
        title: z.string(),
        description: z.string().optional(),
    });

    constructor(readonly title: string, readonly description?: string) {
        super();
    }

    static create(data: unknown): DtoValidationResult<NewTodoDto> {
        return BaseDto.validate<{title: string, description?: string}>(NewTodoDto.schema, data).map(({ title, description }) => new NewTodoDto(title, description));
    }
}

export class FetchTodoDto extends BaseDto {
    private static readonly schema = z.object({
        id: z.string().min(36),
    });

    constructor(readonly id: string) {
        super();
    }

    static create(data: unknown): DtoValidationResult<FetchTodoDto> {
        return BaseDto.validate<{id: string}>(FetchTodoDto.schema, data).map(({ id }) => new FetchTodoDto(id));
    }
}

export class UpdateTodoDto extends BaseDto {
    private static readonly schema = z.object({
        id: z.string().min(36),
        title: z.string().optional(),
        description: z.string().optional(),
        completed: z.boolean().optional(), 
    });

    constructor(readonly id: string, readonly title?: string, readonly description?: string, readonly completed?: boolean) {
        super();
    }

    static create(data: unknown): DtoValidationResult<UpdateTodoDto> {
        return BaseDto.validate<{id: string, title?: string, description?: string, completed?: boolean}>(UpdateTodoDto.schema, data).map(({ id, title, description, completed }) => new UpdateTodoDto(id, title, description, completed));
    }
}

