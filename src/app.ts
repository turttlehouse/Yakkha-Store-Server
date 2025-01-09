// "start": "npx tsc && node build/app.js", //npm start in both case even after nodemon
// "build" : "rimraf ./build && tsc",  //npm run build to compile the TypeScript code
import * as dotenv from 'dotenv';
const result = dotenv.config();

if (result.error) {
  console.error("Error loading .env file:", result.error);
} else {
  console.log("Successfully loaded .env variables");
}

import express,{Application,Request,Response} from 'express';
const app:Application = express();
const PORT:number = process.env.PORT ? parseInt(process.env.PORT) : 5000;
import './database/connection';


app.get('/',(req:Request,res:Response)=>{
    res.send('server connected')
})


app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
});