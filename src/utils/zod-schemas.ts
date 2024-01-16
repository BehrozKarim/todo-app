import * as z from 'zod';

// Zod Schemas for User
const signupSchema = z.object({
    name: z.string().min(3),
    username: z.string().min(3),
    password: z.string().min(8),
    email: z.string().email(),
})

const loginSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(8),
    email: z.string().email().optional(),
}).or(z.object({
    email: z.string().email(),
    password: z.string().min(8),
    username: z.string().min(3).optional(),
}))

const updateUserSchema = z.object({
    name: z.string().min(3).optional(),
    username: z.string().min(3).optional(),
    email: z.string().email().optional(),
})

const restPasswordSchema = z.object({
    oldPassword: z.string().min(8),
    newPassword: z.string().min(8),
})

// Zod Schemas for Todos
const todoSchema = z.object({
    title: z.string().min(3),
    description: z.string().min(3),
})

const idSchema = z.object({
    id: z.string().min(36),
})

const updateTodoSchema = z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(3).optional(),
    completed: z.boolean().optional(),
})

export { signupSchema, loginSchema, updateUserSchema, restPasswordSchema, todoSchema, idSchema, updateTodoSchema }