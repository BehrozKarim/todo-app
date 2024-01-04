// validate username doesn't exist already
import { PrismaClient } from '@prisma/client'
import * as jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

async function usernameExists(username: string) {
    const user = await prisma.user.findUnique({
        where: { username: username },
    })
    if (user) {
        return true
    } else {
        return false
    }
}

async function validPassword(password: string) {
    if (password.length < 8) {
        return false
    } else {
        return true
    }
}

async function isAuthenticated(req: any, res: any, next: any) {
    // extract bearer token from request header
    // const token = req.headers.authorization
    const token = req.headers.authorization?.split(" ")[1]
    if (!token) {
        res.status(401).json("Unauthorized")
    } else {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string)
            if ((decoded as jwt.JwtPayload).id){
                req.userId = (decoded as jwt.JwtPayload).id;
                next();
            } else {
                res.status(401).json("Unauthorized")
            }
        } catch (error) {
            res.status(401).json("Unauthorized")
        }
    }
}



export { usernameExists, validPassword, isAuthenticated }