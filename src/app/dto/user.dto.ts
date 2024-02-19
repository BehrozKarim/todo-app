import { BaseDto, DtoValidationResult } from "@carbonteq/hexapp";
import { z } from "zod";
import { userData } from "../../utils/utils";

export class NewUserDto extends BaseDto {
    private static readonly schema = z.object({
        name: z.string().optional(),
        username: z.string().min(3),
        email: z.string().email(),
        password: z.string().optional(),
    });

    constructor(readonly username: string, readonly email: string, readonly password?: string, readonly name?: string) {
        super();
    }

    static create(data: unknown): DtoValidationResult<NewUserDto> {
        const res = BaseDto.validate<{username: string, email: string, password?: string, name?: string }>(NewUserDto.schema, data);
        return res.map(({ name, username, email, password}) => new NewUserDto(username, email, password, name));
    }
}

export class UpdatedUserDto extends BaseDto {
    private static readonly schema = z.object({
        name: z.string().optional(),
        username: z.string().min(3).optional(),
        email: z.string().email().optional(),
        password: z.string().min(8).optional(),
    });

    constructor(readonly username?: string, readonly email?: string, readonly password?: string, readonly name?: string) {
        super();
    }

    static create(data: unknown): DtoValidationResult<UpdatedUserDto> {
        const res = BaseDto.validate<{username?: string, email?: string, password?: string, name?: string }>(UpdatedUserDto.schema, data);
        return res.map(({ name, username, email, password}) => new UpdatedUserDto(username, email, password, name));
    }
}

export class UserPasswordResetDto extends BaseDto {
    private static readonly schema = z.object({
        oldPassword: z.string().min(8),
        newPassword: z.string().min(8),
    });

    constructor(readonly oldPassword: string, readonly newPassword: string) {
        super();
    }

    static create(data: unknown): DtoValidationResult<UserPasswordResetDto> {
        return BaseDto.validate<{oldPassword: string, newPassword: string}>(UserPasswordResetDto.schema, data).map(({ oldPassword, newPassword }) => new UserPasswordResetDto(oldPassword, newPassword));
    }
}

export class UserLoginDto extends BaseDto {
    private static readonly schema = z.object({
        username: z.string().min(3),
        password: z.string().min(8),
        email: z.string().email().optional(),
    }).or(z.object({
        email: z.string().email(),
        password: z.string().min(8),
        username: z.string().min(3).optional(),
    }));

    constructor(readonly password: string, readonly username?: string, readonly email?: string) {
        super();
    }

    static create(data: unknown): DtoValidationResult<UserLoginDto> {
        return BaseDto.validate<{username?: string, email?: string, password: string}>(UserLoginDto.schema, data).map(({ username, email, password }) => new UserLoginDto(password, username, email));
    }
}
