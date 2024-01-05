import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { usernameExists, createToken } from '../utils/utils'
import * as jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'
import { any, z } from 'zod'
dotenv.config()


const prisma = new PrismaClient()

const signupSchema = z.object({
    name: z.string().min(3),
    username: z.string().min(3),
    password: z.string().min(8),
})

async function createUser(req: any, res: any) {
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

const loginSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(8),
})

async function login(req: any, res: any) {
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

async function logout(req: any, res: any) {
    res.json("Logged out")
}

const updateUserSchema = z.object({
    name: z.string().min(3).optional(),
    username: z.string().min(3).optional(),
})

async function updateUser(req: customRequest, res: Response) {
    const result = updateUserSchema.safeParse(req.body)
    if (!result.success) {
        res.status(400).json(result.error)
        return
    }

    // if request body is empty
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
        currentUserDetails.updatedAt = new Date()
        currentUserDetails = await prisma.user.update({
            where: { id: req.userId },
            data: {
                name: currentUserDetails.name,
                username: currentUserDetails.username,
                updatedAt: currentUserDetails.updatedAt,
            },
        })
        res.json(
            {message: "User Details updated successfully",
            userId: currentUserDetails.id,
            username: currentUserDetails.username,
            name: currentUserDetails.name},
        )
    }
    catch (err) {
        res.status(400).json(err)
    }



    
}

async function deleteUser(req: any, res: any) {
    await prisma.user.delete({
        where: { id: req.params.id },
    }).then((user) => {
        res.json(user)
    }).catch((err) => {
        res.json(err.message)
    })
}

async function getUser(req: any, res: any) {
    if (req.userId !== req.params.id) {
        res.status(401).json("Unauthorized")
        return
    }
    await prisma.user.findUnique({
        where: { id: req.params.id },
    }).then((user) => {
        res.json(user)
    }).catch((err) => {
        res.json(err.message)
    })
}

// TODO: Remove this api
async function getAllUsers(req: any, res: any) {
    const users = await prisma.user.findMany()
    res.json(users)
}

const restPasswordSchema = z.object({
    oldPassword: z.string().min(8),
    newPassword: z.string().min(8),
})

async function changePassword(req: any, res: any) {
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