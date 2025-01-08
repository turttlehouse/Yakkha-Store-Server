// "start": "npx tsc && node build/app.js", //npm start in both case even after nodemon
// "build" : "rimraf ./build && tsc",  //npm run build to compile the TypeScript code
import express,{Application,Request,Response} from 'express';
const app:Application = express();
const PORT:number = 5000;
require('./model/index');

app.get('/',(req:Request,res:Response)=>{
    res.send('server connected')
})


app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
});