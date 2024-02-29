import jwt from "jsonwebtoken";
import { Request, NextFunction } from "express";
import { config } from "../../src/infra/config/config";
interface customRequest extends Request {
    userId?: string
}

async function isAuthenticated(req: customRequest, res: any, next: NextFunction) {
    
    // spliting to extract token only
    const token = req.headers.authorization?.split(" ")[1]
    if (!token) {
        res.status(401).json("Unauthorized")
    } else {
        try {
            // const decoded = jwt.verify(token, process.env.JWT_SECRET as string)
            const decoded = jwt.verify(token, config.jwtSecret)
            if ((decoded as jwt.JwtPayload).id){
                req.body.userId = (decoded as jwt.JwtPayload).id;
                next();
            } else {
                res.status(401).json("Unauthorized")
            }
        } catch (error) {
            res.status(401).json("Unauthorized")
        }
    }
}

export { isAuthenticated }