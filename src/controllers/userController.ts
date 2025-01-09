import {Request,Response} from 'express';
import User from '../database/models/userModel';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

class AuthController{

    //RegisterUser Method
    public static async registerUser(req:Request,res:Response):Promise<void>{
        // try {
            const {username,email,password,role} = req.body;

            if(!username || !email || !password){
                res.status(400).json({message:"Please provide all fields"});
                return;
            }

            if(role && !['admin','customer'].includes(role)){
                res.status(400).json({message:"Invalid role"});
                return;
            }

            const [user] = await User.findAll({
                where :{
                    email : email
                }
            })

            if(user){
                res.status(400).json({message:"User already exists"});
                return;
            }

            await User.create({
                username,
                email,
                // role: role ? role : 'customer',
                role: role,
                password: bcrypt.hashSync(password,8)
            })
            res.status(200).json({
                message:"User registered successfully"
            })
            
        // }catch (error:any) {
        //     res.status(500).json({
        //         message : error.message
        //     })
            
        // }

    }

    //LoginUser method
    public static async loginUser(req:Request,res:Response):Promise<void>{

        const {email,password} = req.body
        if(!email || !password){
            res.status(400).json({message:"Please provide all fields"});
            return;
        }
        //after descrturing no need to check length 
        const [data] = await User.findAll({
            where:{
                email :email
            }
        })

        if(!data){
            res.status(400).json({message:"User not found"});
            return;
        }
        //either true/false will be returned
        const isMatch = bcrypt.compareSync(password,data.password);

        if(!isMatch)
        {
            res.status(200).json({
                message : "Invalid email or password"
            })
        }

        //generate token
        if (!process.env.JWT_SECRET_KEY) {
            res.status(500).json({ message: "JWT secret key is not defined" });
            return;
        }

        const token = jwt.sign({ id: data.id }, process.env.JWT_SECRET_KEY, { expiresIn: '40d' });

        res.status(200).json({
            message : "User logged in successfully",
            data : token
        })
              
    }
}

export default AuthController