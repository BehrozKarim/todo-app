import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
import {userService, UserServiceInterface } from '../../src/app/services/user-service'
import { GetUserDto, NewUserDto, UpdateUserDto, UserLoginDto, UserPasswordResetDto } from '../../src/app/dto/user.dto'
import { cleanLoginData, cleanUserData } from '../../src/utils/utils'
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
        const dto = NewUserDto.create(req.body)
        if (dto.isErr()) {
            res.status(400).json(dto.unwrapErr())
            return
        }

        const result = await this.service.create(dto.unwrap())
        if (result.isErr()) {
            res.status(500).json(result.unwrapErr())
            return
        }
        const response = result.unwrap()
        const data = await cleanLoginData(response)
        res.status(200).json(data)
    }

    async login(req: Request, res: Response) {
        const dto = UserLoginDto.create(req.body)
        if (dto.isErr()) {
            res.status(400).json(dto.unwrapErr())
            return
        }
        const result = await this.service.login(dto.unwrap())
        if (result.isErr()) {
            res.status(500).json(result.unwrapErr())
            return
        }
        const response = result.unwrap()
        res.status(200).json(await cleanLoginData(response))
    }

    async logout(req: Request, res: Response) {
        res.json("Logged out")
    }

    async updateUser(req: customRequest, res: Response) {

        if (req.body.userId){
            const dto = UpdateUserDto.create(req.body)
            if (dto.isErr()) {
                res.status(400).json(dto.unwrapErr())
                return
            }
            const result = await this.service.update(dto.unwrap())
            if (result.isErr()) {
                res.status(500).json(result.unwrapErr())
                return
            }
            const response = result.unwrap()
            res.status(200).json(await cleanUserData(response))
        }
        else {
            res.status(400).json("Invalid Request")
        }
    }

    async deleteUser(req: customRequest, res: Response) {
        if (req.body.userId){
            const dto = GetUserDto.create({userId: req.body.userId})
            if (dto.isErr()) {
                res.status(400).json(dto.unwrapErr())
                return
            }
            const result = await this.service.delete(dto.unwrap())
            if (result.isErr()) {
                res.status(500).json(result.unwrapErr())
                return
            }
            const response = result.unwrap()
            res.status(200).json(response)
        }
        else {
            res.status(400).json("Invalid Request")
        }
    }

    async getUser(req: customRequest, res: Response) {
        if (req.body.userId){
            const dto =  GetUserDto.create({userId: req.body.userId})
            if (dto.isErr()) {
                res.status(400).json(dto.unwrapErr())
                return
            }
            const result = await this.service.get(dto.unwrap())
            if (result.isErr()) {
                res.status(500).json(result.unwrapErr())
                return
            }
            const response = result.unwrap()
            res.status(200).json(await cleanUserData(response))
        }
        else {
            res.status(400).json("Invalid Request")
        }
    }

    async changePassword(req: customRequest, res: Response) {
        if (req.body.userId){
            const dto = UserPasswordResetDto.create(req.body)
            if (dto.isErr()) {
                res.status(400).json(dto.unwrapErr())
                return
            }
            const result = await this.service.changePassword(dto.unwrap())
            if (result.isErr()) {
                res.status(500).json(result.unwrapErr())
                return
            }
            const response = result.unwrap()
            res.status(200).json(await cleanUserData(response))
        }
        else {
            res.status(400).json("Invalid Request")
        }
    }
}

const controller : UserControllerInterface = new UserController(userService)
export default controller