import { Sequelize } from "sequelize-typescript";
import User from "./models/userModel";
import Product from "./models/productModel";

const sequelize = new Sequelize({
    database : process.env.DB_NAME,
    dialect : 'mysql',
    username : process.env.DB_USERNAME,
    password : process.env.DB_PASSWORD,
    host : process.env.DB_HOST,
    port : Number(process.env.DB_PORT),  //sometimes it comes as a string
    models : [__dirname + '/models']  //path to models  folder.(__dirname : current directory name) so current directory bata models folder ko path  

})

//Configuration check
sequelize
.authenticate()
.then(()=>{
    console.log('Database connected successfully')
})
.catch((err)=>{
    console.log('Error connecting to database : ',err)
})

//migration
sequelize.sync({force : false})
.then(()=>{
    console.log('Migration completed : Database synchronized successfully')
})
.catch((err)=>{
    console.log('Migration Error : ',err)
})

//One to Many Relationship
//User has many products
User.hasMany(Product,{foreignKey : 'userId'})
Product.belongsTo(User,{foreignKey : 'userId'})

export default sequelize