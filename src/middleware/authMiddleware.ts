import { Request,Response,NextFunction } from "express";
import User from "../database/models/userModel";
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request{
    user? : {
        id : string,
        username : string,
        email : string,
        role : string
        password : string
    }
}

export enum Role{
    Admin = 'admin',
    Customer = 'customer'
}

class AuthMiddleware{

    async isAuthenticated(req:AuthRequest,res:Response,next:NextFunction):Promise<void>{
        // const token = Array.isArray(req.headers.authorization) ? req.headers.authorization[0] : req.headers.authorization;
        const token = req.headers.authorization
        console.log(token);
       
        if(!token || token === null || token === undefined){
            res.status(403).json({
                message : 'token not provided'
            })
            return
        }

        const secretKey = process.env.JWT_SECRET_KEY;
        if (!secretKey) {
            res.status(500).json({
                message: 'JWT secret key is not defined'
            });
            return;
        }
        jwt.verify(token as string, secretKey, async (err: any, decoded: any) => {
            if(err){
                res.status(403).json({
                    message : 'Invalid token'
                })
                return
            }
            else{
                try {
                    const userData = await User.findByPk(decoded.id)
                    if(!userData){
                        res.status(404).json({
                            message : 'user not found with this token'
                        })
                        return
                    }
                    req.user = userData
                    next()
                       
                } catch (error) {
                    res.status(500).json({
                        message : 'Internal server error'
                    })
                    
                }
            }
        })

    }

    restrictTo(...roles:Role[]){
        return (req:AuthRequest,res:Response,next : NextFunction)=>{
            let userRole = req.user?.role as Role
            if(!roles.includes(userRole)){
                res.status(403).json({
                    message : "You don't have permission to perform this action"
                })
            }else{
                next()
            }
        }
    }
}

export default new AuthMiddleware(); 