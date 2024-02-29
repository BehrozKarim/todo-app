import { Request, Response } from 'express'
import {UserService, UserServiceInterface } from '../../src/app/services/user-service'
import { GetUserDto, NewUserDto, UpdateUserDto, UserLoginDto, UserPasswordResetDto } from '../../src/app/dto/user.dto'
import { cleanLoginData, cleanUserData } from '../../src/utils/utils'
import { inject, injectable, container } from 'tsyringe'
import { HttpResponse } from '../../src/utils/utils'

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

container.register<UserServiceInterface>("UserServiceInterface", { useClass: UserService })
@injectable()
class UserController implements UserControllerInterface {
    constructor(@inject("UserServiceInterface") private readonly service: UserServiceInterface) {}

    createUser = async (req: Request, res: Response) => {
        const dto = NewUserDto.create(req.body)
        if (dto.isErr()) {
            res.status(400).json(dto.unwrapErr())
            return
        }

        const result = await this.service.create(dto.unwrap())
        const response = HttpResponse.fromAppResult(result)
        res.status(response.status).json(await cleanUserData(response.data))
    }

    login = async (req: Request, res: Response) => {
        const dto = UserLoginDto.create(req.body)
        if (dto.isErr()) {
            res.status(400).json(dto.unwrapErr())
            return
        }
        const result = await this.service.login(dto.unwrap())
        const response = HttpResponse.fromAppResult(result)
        res.status(response.status).json(await cleanLoginData(response.data))
    }

    logout = async (req: Request, res: Response) => {
        res.json("Logged out")
    }

    updateUser = async (req: customRequest, res: Response) => {

        if (req.body.userId){
            const dto = UpdateUserDto.create(req.body)
            if (dto.isErr()) {
                res.status(400).json(dto.unwrapErr())
                return
            }
            const result = await this.service.update(dto.unwrap())
            const response = HttpResponse.fromAppResult(result)
            res.status(response.status).json(await cleanUserData(response.data))

        }
        else {
            res.status(400).json("Invalid Request")
        }
    }

    deleteUser = async (req: customRequest, res: Response) => {
        if (req.body.userId){
            const dto = GetUserDto.create({userId: req.body.userId})
            if (dto.isErr()) {
                res.status(400).json(dto.unwrapErr())
                return
            }
            const result = await this.service.delete(dto.unwrap())
            const response = HttpResponse.fromAppResult(result)
            res.status(response.status).json(await cleanUserData(response.data))

        }
        else {
            res.status(400).json("Invalid Request")
        }
    }

    getUser = async (req: customRequest, res: Response) => {
        if (req.body.userId){
            const dto =  GetUserDto.create({userId: req.body.userId})
            if (dto.isErr()) {
                res.status(400).json(dto.unwrapErr())
                return
            }
            const result = await this.service.get(dto.unwrap())
            const response = HttpResponse.fromAppResult(result)
            res.status(response.status).json(await cleanUserData(response.data))

        }
        else {
            res.status(400).json("Invalid Request")
        }
    }

    changePassword = async (req: customRequest, res: Response) => {
        if (req.body.userId){
            const dto = UserPasswordResetDto.create(req.body)
            if (dto.isErr()) {
                res.status(400).json(dto.unwrapErr())
                return
            }
            const result = await this.service.changePassword(dto.unwrap())
            const response = HttpResponse.fromAppResult(result)
            res.status(response.status).json(await cleanUserData(response.data))

        }
        else {
            res.status(400).json("Invalid Request")
        }
    }
}

const controller : UserControllerInterface = container.resolve(UserController)
export default controller