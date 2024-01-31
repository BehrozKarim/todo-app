import {userModel, User} from "../stores/user-store";
import {createToken} from "../../utils/utils";
import {usernameExists, emailExists} from "../../utils/utils";
import * as bcrypt from 'bcrypt'
import { AuthHandlerInterface, authHandler } from "./auth-handler";
import { Result } from "oxide.ts";


type userData = {
    name?: string,
    username: string,
    email: string,
    password?: string,
}

type userReturnData = {
    message: string,
    token?: string,
    expiresIn?: string,
    userId: string,
    name: string | null,
    username: string,
    email: string,
    status: number,
}

type errorData = {
    message: string,
    status : number,
}

interface UserServiceInterface {
    create: (data: userData) => Promise<userReturnData | errorData>,
    login: (username: string, password: string, email: string) => Promise<userReturnData | errorData>,
    update: (data: userData, userId: string) => Promise<userReturnData | errorData>,
    changePassword: (oldPassword: string, newPassword: string, userId: string) => Promise<userReturnData | errorData>,
    delete: (userId: string) => Promise<userReturnData | errorData>,
    get: (userId: string) => Promise<userReturnData | errorData>,
}

class UserService implements UserServiceInterface{
    private model: User
    private auth: AuthHandlerInterface
    constructor(model: User, auth: AuthHandlerInterface ) {
        this.model = model
        this.auth = auth
    }

    async create(data: userData): Promise<userReturnData | errorData>{

        if (await usernameExists(data.username)) {
            return {
                message: "Username already exists",
                status: 400,
            }
        }

        if (await emailExists(data.email)) {
            return {
                message: "Email already exists",
                status: 400,
            }
        }
        if(data.password) {
            const password = await Result.safe(this.auth.hashPassword(data.password))
            if (password.isErr()) {
                return {
                    message: password.unwrapErr().message,
                    status: 500,
                }
            }
            data.password = password.unwrap()
        }
        const [err, user] = (await this.model.create(data)).intoTuple()
        if (err) {
            return {
                message: err.message,
                status: 400,
            }
        }

        // const token = await createToken({userId: user.userId})
        const resultToken = await Result.safe(this.auth.createToken(user.userId))
        if (resultToken.isErr()) {
            return {
                message: resultToken.unwrapErr().message,
                status: 500,
            }
        }
        const token = resultToken.unwrap()
        return {
            message: "User Created Successfully",
            token: token,
            expiresIn: '1d',
            userId: user.userId,
            email: user.email,
            username: user.username,
            name: user.name,
            status: 201,
        }
    }

    async login(username: string, password: string, email: string): Promise<userReturnData | errorData> {
        const [err, user] = (await this.model.findByUsername(username)).intoTuple()
        if (err) {
            return {
                message: err.message,
                status: 404,
            }
        }
        else if (!user) {
            const [err, user] = (await this.model.findByEmail(email)).intoTuple()
            if (err) {
                return {
                    message: err.message,
                    status: 404,
                }
            }
            else if (!user) {
                return {
                    message: "Invalid Credentials",
                    status: 400,
                }
            }
        }
    
        // const match = await bcrypt.compare(password, user.password? user.password: '')
        const match = await Result.safe(this.auth.verifyPassword(password, user.password? user.password: ''))
        if (match.isErr()) {
            return {
                message: match.unwrapErr().message,
                status: 500,
            }
        }
        else if (!match.unwrap()) {
            return {
                message: "Invalid Credentials",
                status: 400,
            }
        }
        
        // const token = await createToken({userId: user.userId})
        const resultToken = await Result.safe(this.auth.createToken(user.userId))
        if (resultToken.isErr()) {
            return {
                message: resultToken.unwrapErr().message,
                status: 500,
            }
        }
        const token = resultToken.unwrap()
        return {
            message: "Logged In Successfully",
            token: token,
            expiresIn: '1d',
            userId: user.userId,
            email: user.email,
            username: user.username,
            name: user.name,
            status: 200,
        }
    }

    async update(data: userData, userId: string): Promise<userReturnData | errorData>{

        const [err, currentUser] = (await this.model.findById(userId)).intoTuple()
        if (err) {
            return {
                message: err.message,
                status: 404,
            }
        }
    
        if (data.username && data.username !== currentUser.username) {
            if (await usernameExists(data.username)) {
                return {
                    message: "Username already exists",
                    status: 400,
                }
            }
        }
    
        if (data.email && data.email !== currentUser.email) {
            if (await emailExists(data.email)) {
                return {
                    message: "Email already exists",
                    status: 400,
                }
            }
        }
    
        const [updateErr, user] = (await userModel.update(data, userId)).intoTuple()
        if (updateErr) {
            return {
                message: updateErr.message,
                status: 404,
            }
        }
    
        return {
            message: "User Updated Successfully",
            userId: user.userId,
            username: user.username,
            name: user.name,
            email: user.email,
            status: 200,
        }
    }

    async changePassword(oldPassword: string, newPassword: string, userId: string): Promise<userReturnData | errorData>{

        const [err, currentUser] = (await userModel.findById(userId)).intoTuple()
        if (err) {
            return {
                message: err.message,
                status: 404,
            }
        }
        else if (!currentUser.password) {
            return {
                message: "Login with Google Account",
                status: 400,
            }
        }
    
        if (await bcrypt.compare(oldPassword, currentUser.password)) {
            const passwordHash = await bcrypt.hash(newPassword, 10)
            const [err, user] = (await this.model.changePassword(passwordHash, userId)).intoTuple()
            if (!user) {
                return {
                    message: err.message,
                    status: 404,
                }
            }
            return {
                message: "Password Changed Successfully",
                userId: user.userId,
                username: user.username,
                name: user.name,
                email: user.email,
                status: 200,
            }
        } else {
            return {
                message: "Invalid Credentials",
                status: 400,
            }
        }
    }

    async delete(userId: string): Promise<userReturnData | errorData>{

        const [err, user] = (await userModel.delete(userId)).intoTuple()
        if (err) {
            return {
                message: err.message,
                status: 404,
            }
        }
        return {
            message: "User Deleted Successfully",
            userId: user.userId,
            username: user.username,
            name: user.name,
            email: user.email,
            status: 200,
        }
    }

    async get(userId: string): Promise<userReturnData | errorData>{

        const [err, user] = (await userModel.findById(userId)).intoTuple()
        if (err) {
            return {
                message: err.message,
                status: 404,
            }
        }
        return {
            message: "User Details Fetched Successfully",
            userId: user.userId,
            username: user.username,
            name: user.name,
            email: user.email,
            status: 200,
        }
    }

}

const userService: UserServiceInterface = new UserService(userModel, authHandler)
export {userService, UserServiceInterface}