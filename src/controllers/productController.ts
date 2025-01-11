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

    async getAllProducts(req:Request,res:Response):Promise<void>{
        const [data] = await Product.findAll();
        if(!data){
            res.status(404).json({
                message : 'No products found'
            })
            return
        }
        res.status(200).json({
            message : "Products fetched successfully",
            data : data
        })
    }
}

export default new ProductController();