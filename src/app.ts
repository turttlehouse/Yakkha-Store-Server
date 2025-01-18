// "start": "npx tsc && node build/app.js", //npm start in both case even after nodemon
// "build" : "rimraf ./build && tsc",  //npm run build to compile the TypeScript code
import * as dotenv from 'dotenv';
dotenv.config();

// const result = dotenv.config();

// if (result.error) {
//   console.error("Error loading .env file:", result.error);
// } else {
//   console.log("Successfully loaded .env variables");
// }

import express,{Application,Request,Response} from 'express';
const app:Application = express();
const PORT:number = process.env.PORT ? parseInt(process.env.PORT) : 5000;
import './database/connection';
import adminSeeder from './adminSeeder';

import userRoute from './routes/userRoute';
import productRoute from './routes/productRoute';
import categoryController from './controllers/categoryController';
import categoryRoute from './routes/categoryRoute';
import cartRoute from './routes/cartRoute';
import orderRoute from './routes/orderRoute';

app.use(express.json());
adminSeeder();

app.use("",userRoute);
app.use("/admin/product",productRoute);
app.use("/admin/category",categoryRoute);
app.use("/customer/cart",cartRoute);
app.use("/order",orderRoute);

app.get('/',(req:Request,res:Response)=>{
    res.send('server connected')
})



app.listen(PORT,()=>{
    categoryController.seedCategory();
    console.log(`Server is running on port ${PORT}`)
}).on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is in use. Trying a new port...`);
      const fallbackPort = PORT + 1;
      app.listen(fallbackPort, () => {
        console.log(`Server is running on fallback port ${fallbackPort}`);
      });
    } else {
      console.error(err);
      process.exit(1); // Exit for other errors
    }
});