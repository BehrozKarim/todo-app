import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
import userModel from '../../domain/stores/user-store'
import { createUserService, loginService, updateUserService, changePasswordService } from '../../domain/services/user-services'
dotenv.config()

interface customRequest extends Request {
    userId?: string
}

// Controller Functions
async function createUser(req: Request, res: Response) {
    const response = await createUserService(req.body)
    res.status(response.status).json(response)
}

async function login(req: Request, res: Response) {
    const response = await loginService(req.body.password, req.body.username, req.body.email)
    res.status(response.status).json(response)
}

async function logout(req: Request, res: Response) {
    res.json("Logged out")
}

async function updateUser(req: customRequest, res: Response) {

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
    if (req.userId){
        const response = await changePasswordService(req.body.oldPassword, req.body.newPassword, req.userId)
        res.status(response.status).json(response)
    }
    else {
        res.status(400).json("Invalid Request")
    }
}

export {
    createUser, updateUser, deleteUser,
    getUser, login, logout, changePassword
}