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
import cors from 'cors';

import {Server} from 'socket.io';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import User from './database/models/userModel';

app.use(cors({
    origin: '*',
    methods: ['GET','POST','PATCH','PUT','DELETE']
}))

app.use(express.json());
adminSeeder();

//make the uploads folder public
app.use(express.static("./src/uploads/"))

app.use("",userRoute);
app.use("/admin/product",productRoute);
app.use("/admin/category",categoryRoute);
app.use("/customer/cart",cartRoute);
app.use("/order",orderRoute);

app.get('/',(req:Request,res:Response)=>{
    res.send('server connected')
})



// app.listen(PORT,()=>{
//     categoryController.seedCategory();
//     console.log(`Server is running on port ${PORT}`)
// }).on('error', (err: any) => {
//     if (err.code === 'EADDRINUSE') {
//       console.error(`Port ${PORT} is in use. Trying a new port...`);
//       const fallbackPort = PORT + 1;
//       app.listen(fallbackPort, () => {
//         console.log(`Server is running on fallback port ${fallbackPort}`);
//       });
//     } else {
//       console.error(err);
//       process.exit(1); // Exit for other errors
//     }
// });

const server = app.listen(PORT,()=>{
    categoryController.seedCategory();
    console.log(`Server is running on port ${PORT}`)
})

const io = new Server(server,{
  cors :{
    origin : '*'
  }
})

let onlineUsers : any[] = []

const addToOnlineUsers = (socketId : string,userId : string,role : string)=>{
  onlineUsers = onlineUsers?.filter((user : any)=>user.userId !== userId)
  onlineUsers.push({socketId,userId,role})

}

io.on('connection',async(socket)=>{
    console.log('a user connected');
    if(socket.handshake && socket.handshake.auth){
    //@ts-ignore
    const {token} = socket.handshake.auth
    
    if(token){
      try {
        // @ts-ignore
      const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET_KEY)

      // {
      //   id: '6bacdcb8-6a22-4acb-81bd-c3a6c1b504d4',
      //   iat: 1740568188,
      //   exp: 1744024188
      // }
      // console.log(decoded)
      if(decoded){
        // @ts-ignore
        const doesUserExists = await User.findByPk(decoded.id)
        // console.log(doesUserExists)
        // {
        //   dataValues: {
        //     id: '6bacdcb8-6a22-4acb-81bd-c3a6c1b504d4',
        //     username: 'sabin',
        //     role: 'customer',
        //     email: 'sabin@gmail.com',
        //     password: '$2b$08$Rj03f88UXpRjySPICuZlReLqMhmOFQyqrS5EjjcTD.gB372DY2pUG',
        //     createdAt: 2025-02-24T02:55:39.000Z,
        //     updatedAt: 2025-02-24T02:55:39.000Z
        //   },
        //   _previousDataValues: {
        //     id: '6bacdcb8-6a22-4acb-81bd-c3a6c1b504d4',
        //     username: 'sabin',
        //     role: 'customer',
        //     email: 'sabin@gmail.com',
        //     password: '$2b$08$Rj03f88UXpRjySPICuZlReLqMhmOFQyqrS5EjjcTD.gB372DY2pUG',
        //     createdAt: 2025-02-24T02:55:39.000Z,
        //     updatedAt: 2025-02-24T02:55:39.000Z
        //   },
        //   uniqno: 1,
        //   _changed: Set(0) {},
        //   _options: {
        //     isNewRecord: false,
        //     _schema: null,
        //     _schemaDelimiter: '',
        //     raw: true,
        //     attributes: [
        //       'id',
        //       'username',
        //       'role',
        //       'email',
        //       'password',
        //       'createdAt',
        //       'updatedAt'
        //     ]
        //   },
        //   isNewRecord: false
        // }
        if(doesUserExists){
          addToOnlineUsers(socket.id,doesUserExists.id,doesUserExists.role)
        }
      }
        
      } catch (error) {
        console.log('error','Invalid token')
        
      }
      

    }
  }else{
    console.log('no token found')
  }

    //
    socket.on('updatedOrderStatus',({status,orderId,userId})=>{
      const findUser = onlineUsers.find((user : any)=>user.userId === userId)
      if(findUser){
        io.to(findUser.socketId).emit("statusUpdated",{status,orderId})
      }
    })


    socket.on('disconnect',()=>{
        console.log('user disconnected');
    })
    // [
    //   {
    //     socketId: 'VlAUMrEa34Ne3SB0AAAB',
    //     userId: '6bacdcb8-6a22-4acb-81bd-c3a6c1b504d4',
    //     role: 'customer'
    //   }
    // ]
    // console.log(onlineUsers);
})