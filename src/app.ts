import express,{Application,Request,Response} from 'express';
const app:Application = express();
const PORT:number = 5000;

app.get('/',(req:Request,res:Response)=>{
    res.send('server connected')
})



app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
});