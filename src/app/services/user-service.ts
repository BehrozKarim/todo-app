import {userModel, User} from "../../infra/stores/user-store";
import {createToken} from "../../utils/utils";
import {usernameExists, emailExists} from "../../utils/utils";
import * as bcrypt from 'bcrypt'


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
    constructor(model: User) {
        this.model = model
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

        const [err, user] = (await this.model.create(data)).intoTuple()
        if (err) {
            return {
                message: err.message,
                status: 400,
            }
        }

        const token = await createToken({userId: user.userId})
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
        let errors = []
        let [err, user] = (await this.model.findByUsername(username)).intoTuple()
        if (err) {
            errors.push(err.message)
        }
        if (!user) {
            [err, user] = (await this.model.findByEmail(email)).intoTuple()
            if (err) {
                errors.push(err.message)
                return {
                    message: errors.join(', '),
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
        
        if (!user.password) {
            return {
                message: "Login with Google Account",
                status: 400,
            }
        }

        const match = await bcrypt.compare(password, user.password? user.password: '')
        if (!match) {
            return {
                message: "Invalid Credentials",
                status: 400,
            }
        }

        const token = await createToken({userId: user.userId})
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

const userService: UserServiceInterface = new UserService(userModel)
export {userService, UserServiceInterface}