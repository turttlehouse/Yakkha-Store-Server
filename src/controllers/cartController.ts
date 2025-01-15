import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Cart from '../database/models/cartModel';
import Product from '../database/models/productModel';


class CartController{
    async addToCart(req:AuthRequest,res:Response):Promise<void>{
        const userId = req.user?.id;

        if(!userId){
            res.status(400).json({
                message : 'Please provide user id'
            })
            return
        }

        const {productId,quantity} = req.body;

        if(!productId || !quantity){
            res.status(400).json({
                message : 'Please provide all the details'
            })
            return
        } 

        //check if product exists in the cart
        let cartItem = await Cart.findOne({
            where : {
                userId : userId,
                productId : productId
            }
        })

        if(cartItem){
            cartItem.quantity = cartItem.quantity + quantity
            await cartItem.save()
        }else{
            //insert new product in the cart
            cartItem = await Cart.create({
                userId : userId,
                productId : productId,
                quantity : quantity
            })
        }
        res.status(200).json({
            message : 'Product added to cart successfully',
            data : cartItem
        })
    }

    async getMyCarts(req:AuthRequest,res:Response):Promise<void>{

        const userId = req.user?.id;
        
        const cartItems = await Cart.findAll({
            where :{
                userId : userId
            },
            include :[
                {
                    model : Product
                }
            ]
        })

        if(cartItems.length === 0){
            res.status(404).json({
                message : 'No products found in the cart'
            })
            return
        }

        res.status(200).json({
            message : "Cart Items Fetched Successfully",
            data : cartItems
        })

    }
}

export default new CartController();