import OrderDetail from "../database/models/orderDetailsModel";
import Order from "../database/models/orderModel";
import Payment from "../database/models/paymentModel";
import { AuthRequest } from "../middleware/authMiddleware";
import { Response,Request } from "express";
import { KhaltiResponse, OrderStatus, PaymentMethod, PaymentStatus, TransactionStatus, TransactionVerificationResponse } from "../types/orderTypes";
import axios from 'axios';
import Product from "../database/models/productModel";

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

        

        for(var i=0; i<items.length;i++){
            await OrderDetail.create({
                orderId : orderData.id,
                productId : items[i].productId,
                quantity : items[i].quantity
            })
        }

        if(paymentDetails.paymentMethod === PaymentMethod.Khalti){
            //khalti payment logic
            //khalti lai kei data pathauna parne hunxa
            const data = {
                //payment success vayepaxi kun url ma redirect garne
                return_url : "http://localhost:5173/success",
                //khalti will accept in paisa only but we are taking in rupees so multiply by 100
                amount : totalAmount * 100,
                website_url : "http://localhost:5173",
                purchase_order_id : orderData.id,
                purchase_order_name :  'orderName_' + orderData.id,
            }

            //khalti le deko endpoint ma hit hanne
            //ko manxe le request gareko tesko header ni chaiyo
            const response = await axios.post('https://dev.khalti.com/api/v2/epayment/initiate/',data,{
                headers :{
                    'Authorization' : 'key 35a596375349476ab4715f92d20f0e02'
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
                url : khaltiResponse.payment_url
            })

        }
        else{
            res.status(200).json({
                message : "Order created successfully"
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

        const response = await axios.post('https://dev.khalti.com/api/v2/epayment/lookup/',{pidx},{
            headers :{
                'Authorization' : 'key 35a596375349476ab4715f92d20f0e02'
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

                    model : Product
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

}

export default new OrderController();