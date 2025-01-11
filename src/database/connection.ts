import { Sequelize } from "sequelize-typescript";
import User from "./models/userModel";
import Product from "./models/productModel";
import Category from "./models/categoryModel";

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

//1:m relationship from perspective of User as User can have/create many products
User.hasMany(Product,{foreignKey : 'userId'})

//m:1 relationship from perspective of product as many products can belong to one user
Product.belongsTo(User,{foreignKey : 'userId'})

//m:1 relationship from perspective of product as many products can belong to one category
Product.belongsTo(Category,{foreignKey : 'categoryId'})

//1:m relationship from perspective of category as one category can have many products
Category.hasMany(Product,{foreignKey : 'categoryId'})

export default sequelize