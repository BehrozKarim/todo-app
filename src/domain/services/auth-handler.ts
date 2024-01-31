import {createToken} from "../../utils/utils";
import * as bcrypt from 'bcrypt'

interface AuthHandlerInterface {
    hashPassword: (password: string) => Promise<string>,
    verifyPassword: (password: string, hash: string) => Promise<boolean>,
    createToken: (userId: string) => Promise<string>,
}

class AuthHandler implements AuthHandlerInterface{
    async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)
        return hash
    }

    async verifyPassword(password: string, hash: string): Promise<boolean> {
        const result = await bcrypt.compare(password, hash)
        return result
    }

    async createToken(userId: string): Promise<string> {
        const token = await createToken({userId: userId})
        return token
    }
}

const authHandler : AuthHandlerInterface = new AuthHandler()
export {AuthHandlerInterface, authHandler}