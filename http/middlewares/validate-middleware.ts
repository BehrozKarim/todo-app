import {
    signupSchema, idSchema, loginSchema,
    restPasswordSchema, todoSchema, updateTodoSchema,
    updateUserSchema 
} from "../../src/utils/zod-schemas";

import { NextFunction, Request, Response } from "express";

async function validateSignup(req: Request, res: Response, next: NextFunction) {
    const result = signupSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json(result.error);
        return;
    }
    next();
}

async function validateLogin(req: Request, res: Response, next: NextFunction) {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json(result.error);
        return;
    }
    next();
}

async function validateUpdateUser(req: Request, res: Response, next: NextFunction) {
    if (Object.keys(req.body).length === 0) {
        res.status(400).json("Empty request body")
        return
    }

    const result = updateUserSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json(result.error);
        return;
    }
    next();
}

async function validateResetPassword(req: Request, res: Response, next: NextFunction) {
    const result = restPasswordSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json(result.error);
        return;
    }
    next();
}

async function validateTodoSchema(req: Request, res: Response, next: NextFunction) {
    const result = todoSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json(result.error);
        return;
    }
    next();
}

async function validateIdSchema(req: Request, res: Response, next: NextFunction) {
    const result = idSchema.safeParse(req.params);
    if (!result.success) {
        res.status(400).json(result.error);
        return;
    }
    next();
}

async function validateUpdateTodoSchema(req: Request, res: Response, next: NextFunction) {
    const result = updateTodoSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json(result.error);
        return;
    }
    next();
}

async function validateAllTasksQuery(req: Request, res: Response, next: NextFunction) {
    if (!req.query.page || parseInt(req.query.page as string) < 1) {
        req.query.page = "1"
    }
    next();
}

export {
    validateSignup, validateLogin, validateUpdateUser,
    validateResetPassword, validateTodoSchema, validateIdSchema,
    validateUpdateTodoSchema, validateAllTasksQuery
}