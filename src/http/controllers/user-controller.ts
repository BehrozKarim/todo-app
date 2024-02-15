import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
import {userService, UserServiceInterface } from '../../app/services/user-service'
import { Result } from 'oxide.ts'
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
        const result = await Result.safe(this.service.create(req.body))
        if (result.isErr()) {
            res.status(500).json(result.unwrapErr())
            return
        }
        const response = result.unwrap()
        res.status(response.status).json(response)
    }

    async login(req: Request, res: Response) {
        const result = await Result.safe(this.service.login(req.body.username, req.body.password, req.body.email))
        if (result.isErr()) {
            res.status(500).json(result.unwrapErr())
            return
        }
        const response = result.unwrap()
        res.status(response.status).json(response)
    }

    async logout(req: Request, res: Response) {
        res.json("Logged out")
    }

    async updateUser(req: customRequest, res: Response) {

        if (req.userId){
            const result = await Result.safe(this.service.update(req.body, req.userId))
            if (result.isErr()) {
                res.status(500).json(result.unwrapErr())
                return
            }
            const response = result.unwrap()
            res.status(response.status).json(response)
        }
        else {
            res.status(400).json("Invalid Request")
        }
    }

    async deleteUser(req: customRequest, res: Response) {
        if (req.userId){
            const result = await Result.safe(this.service.delete(req.userId))
            if (result.isErr()) {
                res.status(500).json(result.unwrapErr())
                return
            }
            const response = result.unwrap()
            res.status(response.status).json(response)
        }
        else {
            res.status(400).json("Invalid Request")
        }
    }

    async getUser(req: customRequest, res: Response) {
        if (req.userId){
            const result = await Result.safe(this.service.get(req.userId))
            if (result.isErr()) {
                res.status(500).json(result.unwrapErr())
                return
            }
            const response = result.unwrap()
            res.status(response.status).json(response)
        }
        else {
            res.status(400).json("Invalid Request")
        }
    }

    async changePassword(req: customRequest, res: Response) {
        if (req.userId){
            const result = await Result.safe(this.service.changePassword(req.body.oldPassword, req.body.newPassword, req.userId))
            if (result.isErr()) {
                res.status(500).json(result.unwrapErr())
                return
            }
            const response = result.unwrap()
            res.status(response.status).json(response)
        }
        else {
            res.status(400).json("Invalid Request")
        }
    }
}

const controller : UserControllerInterface = new UserController(userService)
export default controller