import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
import { userModel } from '../stores/user-store'
import { signupSchema, loginSchema, updateUserSchema, restPasswordSchema } from '../utils/zod-schemas'
import { createUserService, loginService, updateUserService, changePasswordService } from '../services/user-services'
dotenv.config()

interface customRequest extends Request {
    userId?: string
}

const prisma = new PrismaClient()

// Controller Functions
async function createUser(req: Request, res: Response) {
    const result = signupSchema.safeParse(req.body)
    if (!result.success) {
        res.status(400).json(result.error)
        return
    }

    const response = await createUserService(req.body)
    res.status(response.status).json(response)
}

async function login(req: Request, res: Response) {
    const result = loginSchema.safeParse(req.body)
    if (!result.success) {
        res.status(400).json(result.error)
        return
    }

    const response = await loginService(req.body.password, req.body.username, req.body.email)
    res.status(response.status).json(response)
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
        const response = await updateUserService(req.body, req.userId)
        res.status(response.status).json(response)
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
            userId: user.userId,
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
            userId: user.userId,
            username: user.username,
            name: user.name,
            email: user.email,
        })
    }
    else {
        res.status(400).json("Invalid Request")
    }
}

async function changePassword(req: customRequest, res: Response) {
    const result = restPasswordSchema.safeParse(req.body)
    if (!result.success) {
        res.status(400).json(result.error)
        return
    }

    if (req.userId){
        const response = await changePasswordService(req.body.oldPassword, req.body.newPassword, req.userId)
        res.status(response.status).json(response)
    }
    else {
        res.status(400).json("Invalid Request")
    }
}

export {createUser, updateUser, deleteUser, getUser, login, logout, changePassword}