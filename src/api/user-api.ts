import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { usernameExists, createToken } from '../utils/utils'
import * as jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'
import { z } from 'zod'
import { Request, Response } from 'express'
dotenv.config()

interface customRequest extends Request {
    userId?: string
}

const prisma = new PrismaClient()

const signupSchema = z.object({
    name: z.string().min(3),
    username: z.string().min(3),
    password: z.string().min(8),
})

async function createUser(req: Request, res: Response) {
    const result = signupSchema.safeParse(req.body)
    if (!result.success) {
        res.status(400).json(result.error)
        return
    }

    let password_hash = await bcrypt.hash(req.body.password, 10)
    if (await usernameExists(req.body.username)) {
        res.status(400).json(
            "Username already exists")
        return
    }
    await prisma.user.create({
        data: {
            name: req.body.name,
            username: req.body.username,
            password: password_hash,
        },
    }).then(async (user) => {
        const token = await createToken({id: user.id})
        res.json(
            {token: token,
            expiresIn: '1d',
            userId: user.id,
            username: user.username,
            name: user.name},
            )
    }
    ).catch((err) => {
        res.json(err.message)
    })
}

const loginSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(8),
})

async function login(req: Request, res: Response) {
    const result = loginSchema.safeParse(req.body)
    if (!result.success) {
        res.status(400).json(result.error)
        return
    }

    const user = await prisma.user.findUnique({
        where: { username: req.body.username },
    })
    if (user) {
        if (await bcrypt.compare(req.body.password, user.password)) {            
            const token = await createToken({id: user.id})
            res.json(
                {token: token,
                expiresIn: '1d',
                userId: user.id,
                username: user.username,
                name: user.name},
                )
        } else {
            res.status(400).json("Invalid Password")
        }
    } else {
        res.status(400).json("Invalid Username")
    }
}

async function logout(req: Request, res: Response) {
    res.json("Logged out")
}

async function updateUser(req: Request, res: Response) {
    let currentDetails = await prisma.user.findUnique({
        where: { id: req.params.id },
    }).catch((err) => {
        res.json(err.message)
    })
    await prisma.user.update({
        where: { id: req.params.id },
        data: {
            name: req.body.name? req.body.name : currentDetails?.name,
            username: req.body.username? req.body.username : currentDetails?.username,
        },
    }).then((user) => {
        res.json({
            userId: user.id,
            name: user.name,
            username: user.username
            })
    }).
    catch((err) => {
        res.json(err.message)
    })
}

async function deleteUser(req: Request, res: Response) {
    await prisma.user.delete({
        where: { id: req.params.id },
    }).then((user) => {
        res.json(user)
    }).catch((err) => {
        res.json(err.message)
    })
}

async function getUser(req: customRequest, res: Response) {
    await prisma.user.findUnique({
        where: { id: req.userId },
    }).then((user) => {
        res.json(user)
    }).catch((err) => {
        res.json(err)
    })
}

// TODO: Remove this api
async function getAllUsers(req: Request, res: Response) {
    const users = await prisma.user.findMany()
    res.json(users)
}

const restPasswordSchema = z.object({
    oldPassword: z.string().min(8),
    newPassword: z.string().min(8),
})

async function changePassword(req: customRequest, res: Response) {
    const result = restPasswordSchema.safeParse(req.body)
    if (!result.success) {
        res.status(400).json(result.error)
        return
    }

    const user = await prisma.user.findUnique({
        where: { id: req.userId },
    })
    if (user) {
        if (await bcrypt.compare(req.body.oldPassword, user.password)) {
            const password_hash = await bcrypt.hash(req.body.newPassword, 10)
            await prisma.user.update({
                where: { id: req.userId },
                data: {
                    password: password_hash,
                },
            }).then((user) => {
                res.json(
                    {message: "Password changed successfully",
                    userId: user.id,
                    username: user.username,
                    name: user.name},
                )
            }).catch((err) => {
                res.json(err.message)
            })
        } else {
            res.status(400).json("Invalid Password")
        }
    } else {
        res.status(400).json("Invalid Username")
    }
}

export {createUser, updateUser, deleteUser, getUser, getAllUsers, login, logout, changePassword}