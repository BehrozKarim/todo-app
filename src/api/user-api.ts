import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { usernameExists } from '../utils/utils'
import * as jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'
dotenv.config()


const prisma = new PrismaClient()

async function createUser(req: any, res: any) {
    let password_hash = await bcrypt.hash(req.body.password, 10)
    if (await usernameExists(req.body.username)) {
        res.status(400).json(
            "Username already exists")
        return
    }
    const user = await prisma.user.create({
        data: {
            name: req.body.name,
            username: req.body.username,
            password: password_hash,
        },
    }).then((user) => {
        res.json(user)
    }
    ).catch((err) => {
        res.json(err.message)
    })
}

async function login(req: any, res: any) {
    const user = await prisma.user.findUnique({
        where: { username: req.body.username },
    })
    if (user) {
        if (await bcrypt.compare(req.body.password, user.password)) {            
            const token = jwt.sign(
                { id: user.id},
                process.env.JWT_SECRET as string, 
                {expiresIn: '1d',}
                )
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

async function updateUser(req: any, res: any) {
    const user = await prisma.user.update({
        where: { id: req.params.id },
        data: {
            name: req.body.name,
            username: req.body.username,
            password: req.body.password,
        },
    })
    res.json(user)
}

async function deleteUser(req: any, res: any) {
    const user = await prisma.user.delete({
        where: { id: req.params.id },
    })
    res.json(user)
}

async function getUser(req: any, res: any) {
    const user = await prisma.user.findUnique({
        where: { id: req.params.id },
    })
    res.json(user)
}

async function getAllUsers(req: any, res: any) {
    const users = await prisma.user.findMany()
    res.json(users)
}

export {createUser, updateUser, deleteUser, getUser, getAllUsers, login}