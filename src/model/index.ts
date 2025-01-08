import { Sequelize,DataTypes } from "sequelize";
import dbConfig  from "../config/dbConfig";

const sequelize = new Sequelize(dbConfig.db,dbConfig.user,dbConfig.password,{
    host : dbConfig.host,
    dialect : dbConfig.dialect,
    port : 3306,
    pool : {
        max : dbConfig.pool.max,
        min : dbConfig.pool.min,
        idle : dbConfig.pool.idle,
        acquire : dbConfig.pool.acquire
    }
})

sequelize
.authenticate()
.then(()=>{
    console.log('Database connected successfully')
})
.catch((err)=>{
    console.log('Error connecting to database : ',err)
})

//initializing empty object
const db : any = {};
//adding 2 keys 
db.Sequelize = Sequelize;
db.sequelize = sequelize;

//force : 1 /0 
db.sequelize.sync({force : false})
.then(()=>{
    console.log('Database synchronized successfully : migration completed')
})

export default db;