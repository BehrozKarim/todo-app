import jwt from "jsonwebtoken";

async function isAuthenticated(req: any, res: any, next: any) {
    
    // spliting to extract token only
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
    next();
}

export { isAuthenticated }