import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { usernameExists, createToken, emailExists } from '../utils/utils'
import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
import { z } from 'zod'
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

    let passwordHash = await bcrypt.hash(req.body.password, 10)
    if (await usernameExists(req.body.username)) {
        res.status(400).json(
            "Username already exists")
        return
    }
    try {
        const user = await prisma.user.create({
            data: {
                name: req.body.name,
                username: req.body.username,
                password: passwordHash,
                email: req.body.email,
            },
        })
        const token = await createToken({id: user.id})
        res.json(
            {token: token,
            expiresIn: '1d',
            userId: user.id,
            username: user.username,
            name: user.name},
            )
    }
    catch (err) {
        res.status(400).json(err)
    }
}

async function login(req: Request, res: Response) {
    const result = loginSchema.safeParse(req.body)
    if (!result.success) {
        res.status(400).json(result.error)
        return
    }

    let user
    if (req.body.username) {
        user = await prisma.user.findUnique({
            where: { username: req.body.username },
        })
    }
    else if (req.body.email) {
        user = await prisma.user.findUnique({
            where: { email: req.body.email },
        })
    }

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
        res.status(400).json("Invalid Username or email")
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

    try {
        let currentUserDetails = await prisma.user.findUnique({
            where: { id: req.userId },
        })
        if (!currentUserDetails) {
            res.status(404).json({message: "User not found"})
            return
        }

        currentUserDetails.name = req.body.name ? req.body.name : currentUserDetails.name

        if (req.body.username) {
            if (await usernameExists(req.body.username)) {
                res.status(400).json(
                    "Username already exists")
                return
            }
        }
        currentUserDetails.username = req.body.username ? req.body.username : currentUserDetails.username

        if (req.body.email) {
            if (await emailExists(req.body.email)) {
                res.status(400).json(
                    "Email already exists")
                return
            }
        }
        currentUserDetails.email = req.body.email ? req.body.email : currentUserDetails.email

        currentUserDetails.updatedAt = new Date()
        currentUserDetails = await prisma.user.update({
            where: { id: req.userId },
            data: {
                name: currentUserDetails.name,
                username: currentUserDetails.username,
                updatedAt: currentUserDetails.updatedAt,
                email: currentUserDetails.email,
            },
        })

        res.json(
            {message: "User Details updated successfully",
            userId: currentUserDetails.id,
            username: currentUserDetails.username,
            name: currentUserDetails.name,
            email: currentUserDetails.email,},
        )
    }
    catch (err) {
        res.status(400).json(err)
    }



    
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
        res.json(
            {userId: user?.id,
            username: user?.username,
            name: user?.name,
            email: user?.email,}
        )
    }).catch((err) => {
        res.json(err)
    })
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

    const user = await prisma.user.findUnique({
        where: { id: req.userId },
    })
    if (user) {
        if (await bcrypt.compare(req.body.oldPassword, user.password)) {
            const passwordHash = await bcrypt.hash(req.body.newPassword, 10)
            await prisma.user.update({
                where: { id: req.userId },
                data: {
                    password: passwordHash,
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