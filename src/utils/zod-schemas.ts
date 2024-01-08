import exp from 'constants'
import { z } from 'zod'

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

export { signupSchema, loginSchema, updateUserSchema, restPasswordSchema }