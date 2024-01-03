import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function createUser(req: any, res: any) {
    let password_hash = await bcrypt.hash(req.body.password, 10)
    const user = await prisma.user.create({
        data: {
            name: req.body.name,
            username: req.body.username,
            password: password_hash,
        },
    })
    res.json(user)
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

export {createUser, updateUser, deleteUser, getUser, getAllUsers}