import { Request,Response } from "express";

const errorHandler = (fn:Function)=>{
    return (req:Request,res:Response)=>{
        fn(req,res).catch((err:Error)=>{
            // console.log(err)
            return res.status(500).json({
                message : "Internal server error",
                error : err.message
            })
        })
    }
}

export default errorHandler