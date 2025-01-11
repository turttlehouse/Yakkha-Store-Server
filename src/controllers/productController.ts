import { Request, Response } from 'express';
import Product from '../database/models/productModel';
import { AuthRequest } from '../middleware/authMiddleware';

class ProductController{
    async addProduct(req:AuthRequest, res:Response):Promise<void>{

        const userId = req.user?.id;
        
        const {productName,productPrice,productDescription,productStockQty,categoryId} = req.body;

        let fileName;

        if(req.file){
            fileName = req.file.filename
        }else{
            fileName = './src/uploads/default.png'
        }

        if(!productName || !productPrice || !productDescription || !productStockQty || !categoryId){
            res.status(400).json({
                message : 'Please provide all the details'
            })
            return
        }
        
        await Product.create({
            productName,
            productPrice,
            productDescription,
            productStockQty,
            productImageUrl : fileName,
            userId : userId,
            categoryId : categoryId
        })

        res.status(200).json({
            message : "Product Created Successfully"
        })


    }
}

export default new ProductController();