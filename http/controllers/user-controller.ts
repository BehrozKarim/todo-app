import { Request, Response } from 'express'
import {UserService, UserServiceInterface } from '../../src/app/services/user-service'
import { GetUserDto, NewUserDto, UpdateUserDto, UserLoginDto, UserPasswordResetDto } from '../../src/app/dto/user.dto'
import { cleanLoginData, cleanUserData } from '../../shared/shared'
import { inject, injectable, container } from 'tsyringe'
import { HttpResponse } from '../../shared/shared'

interface customRequest extends Request {
    userId?: string
}

interface UserControllerInterface {
    createUser: (req: Request, res: Response) => Promise<void>
    login: (req: Request, res: Response) => Promise<void>
    logout: (req: Request, res: Response) => Promise<void>
    updateUser: (req: customRequest, res: Response) => Promise<void>
    deleteUser: (req: customRequest, res: Response) => Promise<void>
    getUser: (req: customRequest, res: Response) => Promise<void>
    changePassword: (req: customRequest, res: Response) => Promise<void>
}

@injectable()
export class UserController implements UserControllerInterface {
    constructor(@inject("UserServiceInterface") private readonly uService: UserServiceInterface) {}

    createUser = async (req: Request, res: Response) => {
        const dto = NewUserDto.create(req.body)
        const result = await this.uService.create(dto.unwrap())
        const response = HttpResponse.fromAppResult(result)
        res.status(response.status).json(await cleanUserData(response.data))
    }

    login = async (req: Request, res: Response) => {
        const dto = UserLoginDto.create(req.body)
        const result = await this.uService.login(dto.unwrap())
        const response = HttpResponse.fromAppResult(result)
        res.status(response.status).json(await cleanLoginData(response.data))
    }

    logout = async (req: Request, res: Response) => {
        res.json("Logged out")
    }

    updateUser = async (req: customRequest, res: Response) => {

        const dto = UpdateUserDto.create(req.body)
        const result = await this.uService.update(dto.unwrap())
        const response = HttpResponse.fromAppResult(result)
        res.status(response.status).json(await cleanUserData(response.data))
    }

    deleteUser = async (req: customRequest, res: Response) => {
        const dto = GetUserDto.create({userId: req.body.userId})
        const result = await this.uService.delete(dto.unwrap())
        const response = HttpResponse.fromAppResult(result)
        res.status(response.status).json(await cleanUserData(response.data))
    }

    getUser = async (req: customRequest, res: Response) => {
        const dto =  GetUserDto.create({userId: req.body.userId})
        const result = await this.uService.get(dto.unwrap())
        const response = HttpResponse.fromAppResult(result)
        res.status(response.status).json(await cleanUserData(response.data))
    }

    changePassword = async (req: customRequest, res: Response) => {
        const dto = UserPasswordResetDto.create(req.body)
        const result = await this.uService.changePassword(dto.unwrap())
        const response = HttpResponse.fromAppResult(result)
        res.status(response.status).json(await cleanUserData(response.data))
    }
}