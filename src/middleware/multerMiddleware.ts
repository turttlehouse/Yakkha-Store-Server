import multer from "multer";
import {Request} from 'express'


const storage = multer.diskStorage({
    destination : function(req:Request,file: Express.Multer.File,cb:Function){
        const allowedFileTypes = ['image/jpeg','image/jpg','image/png']
        if(!allowedFileTypes.includes(file.mimetype)){
            cb(new Error("This file type is not supported"))
        }
        cb(null,'./src/uploads')
    },

    filename : function(req:Request,file : Express.Multer.File,cb:Function){
        cb(null,Date.now() + "-" + file.originalname)
    }
});

export {
    multer,
    storage
}