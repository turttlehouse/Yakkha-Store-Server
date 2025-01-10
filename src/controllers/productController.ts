import { Request, Response } from 'express';
import Product from '../database/models/productModel';

class ProductController{
    async addProduct(req:Request, res:Response):Promise<void>{

        const {productName,productPrice,productDescription,productStockQty} = req.body;

        let fileName;

        if(req.file){
            fileName = req.file.filename
        }else{
            fileName = './src/uploads/default.png'
        }

        if(!productName || !productPrice || !productDescription || !productStockQty){
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
            productImageUrl : fileName
        })

        res.status(200).json({
            message : "Product Created Successfully"
        })


    }
}

export default new ProductController();