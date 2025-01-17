import express, { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import errorHandler from "../services/catchAsync";
import orderController from "../controllers/orderController";


const router : Router = express.Router();


router.route('/')
.post(authMiddleware.isAuthenticated,errorHandler(orderController.createOrder))

router.route('/verify')
.post(authMiddleware.isAuthenticated,errorHandler(orderController.verifyTransaction))


router.route('/customer')
.post(authMiddleware.isAuthenticated,errorHandler(orderController.fetchMyOrders))

router.route('/:id')
.get(authMiddleware.isAuthenticated,errorHandler(orderController.fetchOrderDetails))

export default router