import {userModel} from "../stores/user-store";
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

async function createUserService(data: userData): Promise<userReturnData | errorData>{

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

    const user = await userModel.create(data)
    if (!user) {
        return {
            message: "Internal Server Error",
            status: 500,
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
        status: 200,
    }
}

async function loginService(password: string, username?: string, email?: string) : Promise<userReturnData | errorData>{

    if ((!username && !email) || !password ) {
        return {
            message: "Invalid Credentials",
            status: 400,
        }
    }

    let user;
    if (username) {
        user = await userModel.findByUsername(username)
    }
    else if (email) {
        user = await userModel.findByEmail(email)
    }

    if (user && user.password) {
        if (await bcrypt.compare(password, user.password)) {            
            const token = await createToken({userId: user.userId})
            return {
                message: "Login Successful",
                token: token,
                expiresIn: '1d',
                userId: user.userId,
                email: user.email,
                username: user.username,
                name: user.name,
                status: 200,
            }
        } else {
            return {
                message: "Invalid Credentials",
                status: 400,
            }
        }
    } else {
        return {
            message: "Invalid Credentials",
            status: 400,
        }
    }
}

async function updateUserService(data: userData, userId: string): Promise<userReturnData | errorData>{

    const currentUser = await userModel.findById(userId)
    if (!currentUser) {
        return {
            message: "User Not Found",
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

    const user = await userModel.update(data, userId)
    if (!user) {
        return {
            message: "Internal Server Error",
            status: 500,
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

async function changePasswordService(oldPassword: string, newPassword: string, userId: string): Promise<userReturnData | errorData>{

    const currentUser = await userModel.findById(userId)
    if (!currentUser) {
        return {
            message: "User Not Found",
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
        const user = await userModel.changePassword(passwordHash, userId)
        if (!user) {
            return {
                message: "Internal Server Error",
                status: 500,
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

export {
    createUserService, loginService, updateUserService,
    changePasswordService
}