import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
import {userService, UserServiceInterface } from '../../domain/services/user-service'
dotenv.config()

interface customRequest extends Request {
    userId?: string
}

interface UserControllerInterface {
    createUser(req: Request, res: Response): Promise<void>
    login(req: Request, res: Response): Promise<void>
    logout(req: Request, res: Response): Promise<void>
    updateUser(req: customRequest, res: Response): Promise<void>
    deleteUser(req: customRequest, res: Response): Promise<void>
    getUser(req: customRequest, res: Response): Promise<void>
    changePassword(req: customRequest, res: Response): Promise<void>
}

class UserController implements UserControllerInterface {
    private service: UserServiceInterface

    constructor(service: UserServiceInterface) {
        this.service = service
    }

    async createUser(req: Request, res: Response) {
        const response = await this.service.create(req.body)
        res.status(response.status).json(response)
    }

    async login(req: Request, res: Response) {
        const response = await this.service.login(req.body.username, req.body.password, req.body.email)
        res.status(response.status).json(response)
    }

    async logout(req: Request, res: Response) {
        res.json("Logged out")
    }

    async updateUser(req: customRequest, res: Response) {

        if (req.userId){
            const response = await this.service.update(req.body, req.userId)
            res.status(response.status).json(response)
        }
        else {
            res.status(400).json("Invalid Request")
        }
    }

    async deleteUser(req: customRequest, res: Response) {
        if (req.userId){
            const response = await this.service.delete(req.userId)
            res.status(response.status).json(response)
        }
        else {
            res.status(400).json("Invalid Request")
        }
    }

    async getUser(req: customRequest, res: Response) {
        if (req.userId){
            const response = await this.service.get(req.userId)
            res.status(response.status).json(response)
        }
        else {
            res.status(400).json("Invalid Request")
        }
    }

    async changePassword(req: customRequest, res: Response) {
        if (req.userId){
            const response = await this.service.changePassword(req.body.oldPassword, req.body.newPassword, req.userId)
            res.status(response.status).json(response)
        }
        else {
            res.status(400).json("Invalid Request")
        }
    }
}

const controller : UserControllerInterface = new UserController(userService)
export default controller