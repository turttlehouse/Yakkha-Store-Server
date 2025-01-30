import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Cart from '../database/models/cartModel';
import Product from '../database/models/productModel';
import Category from '../database/models/categoryModel';


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
        const data = await Cart.findAll({
            where :{
                userId
            }
        })

        // const product = await Product.findByPk(productId)
        res.status(200).json({
            message : 'Product added to cart successfully',
            data : data
            // data : {
            //     spread garda orm le meta data ni return garirahunxa so json ma conversion
            //     ...cartItem.toJSON(),
            //     product : product?.toJSON()
            // }
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
                    model : Product,
                    attributes : ['productName','productDescription','productImageUrl'],
                    include : [
                        {
                            model : Category,
                            attributes : ['id','categoryName']
                        }
                    ]
                }
            ],
            attributes : ['productId','quantity']
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

    async deleteMyCartItem(req:AuthRequest,res:Response):Promise<void>{
        const userId = req.user?.id;
        const {productId} = req.params;

        const product = await Product.findByPk(productId);
        if(!product){
            res.status(404).json({
                message : 'Product not found in the cart'
            })
            return
        }

        await Cart.destroy({
            where : {
                userId : userId,
                productId : productId 
            }
        })

        res.status(200).json({
            message : 'Cart items deleted successfully'
        })
    }

    async updateCartItem(req:AuthRequest,res:Response):Promise<void>{
        const userId = req.user?.id;
        const {productId} = req.params;
        const {quantity} = req.body;
        if(!quantity){
            res.status(400).json({
                message : 'Please provide quantity'
            })
            return
        }

        const cartData : Cart | null = await Cart.findOne({
            where :{
                userId,
                productId
            }
        })

        if(!cartData){
            res.status(404).json({
                message : 'Product not found in the cart'
            })
            return
        }

        cartData.quantity = quantity;
        await cartData?.save();

        res.status(200).json({
            message : "Cart item updated successfully",
            data : cartData
        })


    }
}

export default new CartController();