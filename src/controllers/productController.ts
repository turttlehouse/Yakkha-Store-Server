import { Request, Response } from 'express';
import Product from '../database/models/productModel';
import { AuthRequest } from '../middleware/authMiddleware';
import User from '../database/models/userModel';
import Category from '../database/models/categoryModel';

class ProductController{
    
    async addProduct(req:AuthRequest, res:Response):Promise<void>{

        const userId = req.user?.id;
        
        const {productName,productPrice,productDescription,productTotalStockQty,categoryId} = req.body;

        let fileName;

        if(req.file){
            fileName = req.file.filename
        }else{
            fileName = './src/uploads/default.png'
        }

        if(!productName || !productPrice || !productDescription || !productTotalStockQty || !categoryId){
            res.status(400).json({
                message : 'Please provide all the details'
            })
            return
        }
        
        await Product.create({
            productName,
            productPrice,
            productDescription,
            productTotalStockQty,
            productImageUrl : fileName,
            userId : userId,
            categoryId : categoryId
        })

        res.status(200).json({
            message : "Product Created Successfully"
        })


    }

    async getAllProducts(req:Request,res:Response):Promise<void>{
        const data = await Product.findAll({
            include : [
                //join with user table
                {
                    model : User,
                    attributes : ['username','id','email']
                },
                //join with category table
                {
                    model : Category,
                    attributes : ['categoryName']
                }
            ]
        });
        if(data.length === 0){
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

    async getSingleProduct(req:Request,res:Response): Promise<void>{

        const id = req.params.id;
        const data = await Product.findAll({
            where : {
                id : id
            },
            include : [
                {
                    model : User,
                    attributes : ['username','id','email']
                },
                {
                    model : Category,   
                    attributes : ['categoryName']
                }
            ]
        })
        if(data.length === 0){
            res.status(404).json({
                message : 'No product found'
            })
            return
        }
        res.status(200).json({
            message : 'Product fetched successfully',
            //key-value pair same so we can write only data
            //data : data
            data 
        })

    }

    async deleteProduct(req:AuthRequest,res:Response):Promise<void>{
        const {id} = req.params;
        const data = await Product.findAll({
            where : {
                id : id
            }
        })
        if(data.length === 0){
            res.status(404).json({
                message : 'No product found'
            })
            return
        }
        // const userId = req.user?.id;
        // const data = await Product.destroy({
        //     where : {
        //         id : id,
        //         userId : userId
        //     }
        // })
        await Product.destroy({
            where : {
                id : id,
            }
        })
        res.status(200).json({
            message : 'Product deleted successfully'
        })
    }    
}

export default new ProductController();