import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
import { User, userModel} from '../../domain/stores/user-store'
import { createUserService, loginService, updateUserService, changePasswordService } from '../../domain/services/user-services'
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
    private model: User
    constructor(model: User) {
        this.model = model
    }

    async createUser(req: Request, res: Response) {
        const response = await createUserService(req.body)
        res.status(response.status).json(response)
    }

    async login(req: Request, res: Response) {
        const response = await loginService(req.body.password, req.body.username, req.body.email)
        res.status(response.status).json(response)
    }

    async logout(req: Request, res: Response) {
        res.json("Logged out")
    }

    async updateUser(req: customRequest, res: Response) {

        if (req.userId){
            const response = await updateUserService(req.body, req.userId)
            res.status(response.status).json(response)
        }
        else {
            res.status(400).json("Invalid Request")
        }
    }

    async deleteUser(req: customRequest, res: Response) {
        
        if (req.userId){
            const user = await this.model.delete(req.userId)
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

    async getUser(req: customRequest, res: Response) {
        if (req.userId){
            const user = await this.model.findById(req.userId)
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

    async changePassword(req: customRequest, res: Response) {
        if (req.userId){
            const response = await changePasswordService(req.body.oldPassword, req.body.newPassword, req.userId)
            res.status(response.status).json(response)
        }
        else {
            res.status(400).json("Invalid Request")
        }
    }
}

// export {UserController, UserControllerInterface}
const controller : UserControllerInterface = new UserController(userModel)
export default controller