import express, { Router } from "express";
import authMiddleware,{Role} from "../middleware/authMiddleware";
import {multer, storage } from "../middleware/multerMiddleware";
import productController from "../controllers/productController";

const upload = multer({storage : storage})
const router : Router = express.Router();


router.route('/')
.post(authMiddleware.isAuthenticated,authMiddleware.restrictTo(Role.Admin),
upload.single('image'),productController.addProduct)

.get(productController.getAllProducts)


export default router