import { PrismaClient } from '@prisma/client'
import { usernameExists, createToken, emailExists } from '../utils/utils'
import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
import { z } from 'zod'
import { userModel, loginService } from '../stores/user-store'

dotenv.config()

interface customRequest extends Request {
    userId?: string
}

// Zod Schemas
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

const prisma = new PrismaClient()

// Controller Functions
async function createUser(req: Request, res: Response) {
    const result = signupSchema.safeParse(req.body)
    if (!result.success) {
        res.status(400).json(result.error)
        return
    }

    if (await usernameExists(req.body.username)) {
        res.status(400).json(
            "Username already exists")
        return
    }

    const user = await userModel.create(req.body)
    if (!user) {
        res.status(500).json({message: "Internal Server Error"})
        return
    }

    const token = await createToken({id: user.id})
    res.json({
        message: "User Created Successfully",
        token: token,
        expiresIn: '1d',
        userId: user.id,
        username: user.username,
        name: user.name
    })
}

async function login(req: Request, res: Response) {
    const result = loginSchema.safeParse(req.body)
    if (!result.success) {
        res.status(400).json(result.error)
        return
    }

    const token = await loginService(req.body.password, req.body.username, req.body.email)
    if (!token) {
        res.status(400).json("Invalid Credentials")
        return
    }
    else {
        res.json({
            message: "Login Successful",
            token: token,
            expiresIn: '1d',
        })
    }
}

async function logout(req: Request, res: Response) {
    res.json("Logged out")
}

async function updateUser(req: customRequest, res: Response) {
    const result = updateUserSchema.safeParse(req.body)
    if (!result.success) {
        res.status(400).json(result.error)
        return
    }

    if (Object.keys(req.body).length === 0) {
        res.status(400).json("Empty request body")
        return
    } 
    if (req.userId){
        const user = await userModel.update(req.body, req.userId)
        if (!user) {
            res.status(500).json({message: "Internal Server Error"})
            return
        }
        res.json({
            message: "User Updated Successfully",
            userId: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
        })
    }
    else {
        res.status(400).json("Invalid Request")
    }
}

async function deleteUser(req: customRequest, res: Response) {
    
    if (req.userId){
        const user = await userModel.delete(req.userId)
        if (!user) {
            res.status(500).json({message: "Internal Server Error"})
            return
        }
        res.json({
            message: "User Deleted Successfully",
            userId: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
        })
    }
    else {
        res.status(400).json("Invalid Request")
    }
}

async function getUser(req: customRequest, res: Response) {
    if (req.userId){
        const user = await userModel.findById(req.userId)
        if (!user) {
            res.status(500).json({message: "Internal Server Error"})
            return
        }
        res.json({
            message: "User Details Fetched Successfully",
            userId: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
        })
    }
    else {
        res.status(400).json("Invalid Request")
    }
}

// TODO: Remove this api
async function getAllUsers(req: Request, res: Response) {
    const users = await prisma.user.findMany()
    res.json(
        users.map((user) => {
            return {
                userId: user.id,
                username: user.username,
                name: user.name,
                email: user.email,
            }
        })
    )
}

async function changePassword(req: customRequest, res: Response) {
    const result = restPasswordSchema.safeParse(req.body)
    if (!result.success) {
        res.status(400).json(result.error)
        return
    }

    if (req.userId){
        const user = await userModel.changePassword(req.body, req.userId)
        if (!user) {
            res.status(500).json({message: "Internal Server Error"})
            return
        }
        res.json({
            message: "Password Changed Successfully",
            userId: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
        })
    }
}

export {createUser, updateUser, deleteUser, getUser, getAllUsers, login, logout, changePassword}