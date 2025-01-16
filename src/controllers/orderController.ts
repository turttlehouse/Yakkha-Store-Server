import OrderDetail from "../database/models/orderDetailsModel";
import Order from "../database/models/orderModel";
import Payment from "../database/models/paymentModel";
import { AuthRequest } from "../middleware/authMiddleware";
import { Response } from "express";
import { KhaltiResponse, PaymentMethod } from "../types/orderTypes";
import axios from 'axios';


class OrderController{

    async createOrder(req:AuthRequest,res:Response){
        const userId = req.user?.id;
        const {phoneNumber,shippingAddress,totalAmount,items,paymentDetails} = req.body;

        if(!phoneNumber || !shippingAddress || !totalAmount || !items || !paymentDetails || !paymentDetails.paymentMethod ||  items.length === 0){
            return res.status(400).json({
                message : 'please provide phoneNumber,shippingAddress,totalAmount,items and paymentDetails'
            })
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
                return_url : "http://localhost:50001/success",
                //khalti will accept in paisa only but we are taking in rupees so multiply by 100
                amount : totalAmount * 100,
                website_url : "http://localhost:5000",
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

}

export default new OrderController();