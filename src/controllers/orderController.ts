import OrderDetail from "../database/models/orderDetailsModel";
import Order from "../database/models/orderModel";
import Payment from "../database/models/paymentModel";
import { AuthRequest } from "../middleware/authMiddleware";
import { Response,Request } from "express";
import { KhaltiResponse, OrderStatus, PaymentMethod, PaymentStatus, TransactionStatus, TransactionVerificationResponse } from "../types/orderTypes";
import axios from 'axios';
import Product from "../database/models/productModel";
import Cart from "../database/models/cartModel";
import User from "../database/models/userModel";
import Category from "../database/models/categoryModel";

//order class model ma payment id xaina 
class ExtendedOrder extends Order{
    declare paymentId : string | null
}

class OrderController{

    async createOrder(req:AuthRequest,res:Response):Promise<void>{
        const userId = req.user?.id;
        const {phoneNumber,shippingAddress,totalAmount,items,paymentDetails} = req.body;

        if(!phoneNumber || !shippingAddress || !totalAmount || !items || !paymentDetails || !paymentDetails.paymentMethod ||  items.length === 0){
            res.status(400).json({
                message : 'please provide phoneNumber,shippingAddress,totalAmount,items and paymentDetails'
            })
            return
        }

        const paymentData = await Payment.create({
            paymentMethod : paymentDetails.paymentMethod,
        })

        const orderData = await Order.create({
            phoneNumber,
            shippingAddress,
            totalAmount,
            userId,
            paymentId : paymentData.id  
        })

        let responseOrderData;

        for(var i=0; i<items.length;i++){
            responseOrderData = await OrderDetail.create({
                orderId : orderData.id,
                productId : items[i].productId,
                quantity : items[i].quantity
            })
            await Cart.destroy({
                where : {
                    userId : userId,
                    productId : items[i].productId
                }
            })
        }

        if(paymentDetails.paymentMethod === PaymentMethod.Khalti){

            const BASE_URL = process.env.KHALTI_API_BASE_URL;
            const API_KEY = process.env.KHALTI_API_KEY;
            const SUCCESS_URL = process.env.APP_SUCCESS_URL;
            const WEBSITE_URL = process.env.APP_WEBSITE_URL;

            //khalti payment logic
            //khalti lai kei data pathauna parne hunxa
            const data = {
                //payment success vayepaxi kun url ma redirect garne
                return_url : SUCCESS_URL,
                //khalti will accept in paisa only but we are taking in rupees so multiply by 100
                amount : totalAmount * 100,
                website_url :  WEBSITE_URL,
                purchase_order_id : orderData.id,
                purchase_order_name :  'orderName_' + orderData.id,
            }

            //khalti le deko endpoint ma hit hanne
            //ko manxe le request gareko tesko header ni chaiyo
            const response = await axios.post(`${BASE_URL}/epayment/initiate/`,data,{
                headers :{
                    'Authorization' : `key ${API_KEY}`
                }
            })

            //After inititating the payment, khalti will return the response in the following format
            // data: {
            //     pidx: 'BjCAJsgerhSfkbpiqkhvMo',
            //     payment_url: 'https://test-pay.khalti.com/?pidx=BjCAJsgerhSfkbpiqkhvMo',
            //     expires_at: '2025-01-16T22:27:12.380928+05:45',
            //     expires_in: 1800
            //   }
            // console.log(response)

            //explicity typecasting
            const khaltiResponse : KhaltiResponse = response?.data as KhaltiResponse;
            paymentData.pidx = khaltiResponse.pidx;
            //Db ma persist garna
            paymentData.save();

            res.status(200).json({
                message : "Order created successfully",
                url : khaltiResponse.payment_url,
                data : responseOrderData
            })

        }
        else{
            res.status(200).json({
                message : "Order created successfully",
                data : responseOrderData
            })
        }

    }

    async verifyTransaction(req:AuthRequest,res:Response):Promise<void>{
        const {pidx} = req.body;
        if(!pidx){
            res.status(400).json({
                message : 'please provide pidx'
            })
            return
        }
        // const userId = req.user?.id;
        const BASE_URL = process.env.KHALTI_API_BASE_URL
        const API_KEY = process.env.KHALTI_API_KEY;

        const response = await axios.post(`${BASE_URL}/epayment/lookup/`,{pidx},{
            headers :{
                'Authorization' : `key ${API_KEY}`
            }
        })

        const data : TransactionVerificationResponse = response?.data as TransactionVerificationResponse;
        // console.log(data)
        if(data.status === TransactionStatus.Completed){
            // let order = await Order.findAll({
            //     where :{
            //         userId : userId
            //     },
            //     include : [
            //         {
            //             model : Payment
            //         }
            //     ]
            // })
            await Payment.update({paymentStatus : PaymentStatus.Paid},{
                where :{
                    pidx : pidx
                }
            })

            res.status(200).json({
                message : "Payment Verified Successfully"
            })
        }
        else{
            res.status(200).json({
                message : "Payment not verified"
            })
        }

    }

    async  fetchMyOrders(req:AuthRequest,res:Response):Promise<void>{
        const userId = req.user?.id
        const orders = await Order.findAll({
            where :{
                userId : userId
            },
            include :[
                {
                    model : Payment
                }
            ]
        })

        if(orders.length > 0)
        {
            res.status(200).json({
                message : "Orders fetched successfully",
                data : orders
            })
            return
        }
        else{
            res.status(200).json({
                message : "No orders found",
                data : []
            })
        }

    }
     
    async  fetchOrders(req:AuthRequest,res:Response):Promise<void>{
        const orders = await Order.findAll({
            include :[
                {
                    model : Payment
                }
            ]
        })

        if(orders.length > 0)
        {
            res.status(200).json({
                message : "Orders fetched successfully",
                data : orders
            })
            return
        }
        else{
            res.status(200).json({
                message : "No orders found",
                data : []
            })
        }

    }

    async fetchOrderDetails(req:AuthRequest, res :Response):Promise<void>{
        // const userId = req.user?.id;
        const orderId = req.params?.id;
        if(!orderId){
            res.status(400).json({
                message : 'please provide orderId'
            })
            return
        }

        const orderDetails = await OrderDetail.findAll({
            where : {
                orderId : orderId,
            },
            include :[
                {

                    model : Product,
                    include : [
                        {
                            model : Category,
                            attributes : [ "categoryName"]
                        }
                    ]
                },{
                    model : Order,
                    include : [{
                        model : Payment,
                        attributes : ['paymentMethod','paymentStatus']
                    },
                    {
                        model : User,
                        attributes : [ "username","email"]
                    }
                
                ],
                }
            ]
        })

        if(orderDetails.length === 0){
            res.status(200).json({
                message : "No order found",
                data : []
            })
            return
        }
        res.status(200).json({
            message : "Order details fetched successfully",
            data : orderDetails
        })
    }

    async cancelOrder(req:AuthRequest,res:Response) : Promise<void>{
        const userId = req.user?.id;
        const orderId = req.params?.id;
        if(!orderId){
            res.status(400).json({
                message : 'please provide orderId'
            })
            return
        }

        //in real world scenario also it can only single object
        const orders:any[] = await Order.findAll({
            where :{
                userId : userId,
                id : orderId
            }   
        })
        // console.log(orders);
        if(orders.length > 0)
        {
            const order = orders[0]
            if(order?.orderStatus === OrderStatus.Ontheway || order?.orderStatus === OrderStatus.Delivered || order?.orderStatus === OrderStatus.Preparation){
                res.status(400).json({
                    message : "Order cannot be cancelled if it is on the way or delivered or in preparation"
                })
                return
            }

        }

        await Order.update({orderStatus : OrderStatus.Cancelled},{
            where :{
                userId : userId,
                id : orderId
            }
        })
        res.status(200).json({
            message : 'Order cancelled successfully'
        })
    }

    async changeOrderStatus(req:Request, res : Response) :Promise<void>{
        const orderId = req.params?.id;
        const {orderStatus} = req.body;
        if(!orderId || !orderStatus){
            res.status(400).json({
                message : 'please provide orderId and orderStatus'
            })
            return
        }

        await Order.update({orderStatus : orderStatus},{
            where : {
                id : orderId
            }
        })

        res.status(200).json({
            message : 'Order status updated successfully' 
        })

    }

    async changePaymentStatus(req:Request,res:Response):Promise<void>{
        const orderId = req.params?.id;
        const {paymentStatus} = req.body;

        const order = await Order.findByPk(orderId);
        if(!order){
            res.status(400).json({
                message : 'Order not found'
            })
            return
        }
        const extendedOrder : ExtendedOrder = order as ExtendedOrder;
        if(!extendedOrder.paymentId){
            res.status(400).json({
                message : 'Payment not done'
            })
            return
        }

        await Payment.update({paymentStatus:paymentStatus},{
            where : {
                id : extendedOrder.paymentId
            }
        })

        res.status(200).json({
            message : `Payment status of orderId ${orderId} updated successfully to ${paymentStatus}`
        })

    }

    async deleteOrder(req:Request,res:Response):Promise<void>{
        const orderId = req.params?.id;
        if(!orderId){
            res.status(400).json({
                message : 'please provide orderId'
            })
            return
        }
        const order = await Order.findByPk(orderId);
        const extendedOrder : ExtendedOrder = order as ExtendedOrder;

        // Note :The general rule is that you should delete the child records 
        // (i.e., the payment table and OrderDetail table) before the parent record (i.e., the Order table) because

        // Foreign Key Constraints: If the OrderDetail table has a foreign key constraint that references the Order table, the database might not allow deletion of the Order record if related records still exist in the OrderDetail table. Attempting to delete the parent record before the child records would lead to an error.

        // Referential Integrity: Deleting the OrderDetail records first ensures that there are no references to the Order left behind. This makes it easier to delete the Order record afterwards without leaving any broken relationships in the database.

        // Deleting the payment record first, using the paymentId from the order
        await Payment.destroy({
            where :{
                id : extendedOrder.paymentId
            }
        })
        // Deleting the order details first to ensure no foreign key constraint is violated
        await OrderDetail.destroy({
            where : {
                orderId : orderId
            }
        })

        // Now deleting the order
        await Order.destroy({
            where : {
                id : orderId
            }
        })

       
        res.status(200).json({
            message : 'Order deleted successfully'
        })
    }

}

export default new OrderController();