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

//force : use of  1 /0  instead of true/false is also valid.
db.sequelize.sync({force : false})
.then(()=>{
    console.log('Migration completed : Database synchronized successfully')
})

export default db;