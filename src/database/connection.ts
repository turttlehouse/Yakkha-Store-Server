import { Sequelize } from "sequelize-typescript";
import User from "./models/userModel";
import Product from "./models/productModel";
import Category from "./models/categoryModel";
import Cart from "./models/cartModel";
import Order from "./models/orderModel";
import OrderDetail from "./models/orderDetailsModel";
import Payment from "./models/paymentModel";

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

//User and Product relationship

//1:m relationship from perspective of User as User can have/create many products
User.hasMany(Product,{foreignKey : 'userId'})

//m:1 relationship from perspective of product as many products can belong to one user
Product.belongsTo(User,{foreignKey : 'userId'})

//Product and Category relationship

//m:1 relationship from perspective of product as many products can belong to one category
Product.belongsTo(Category,{foreignKey : 'categoryId'})
//1:m relationship from perspective of category as one category can have many products
Category.hasMany(Product,{foreignKey : 'categoryId'})

//Cart and  User relationship

//1:m relationship from perspective of user as 
// one user can have many carts
User.hasMany(Cart,{foreignKey : 'userId'})
//Each Cart belongs to one User.
Cart.belongsTo(User,{foreignKey : 'userId'})

//Cart and Product relationship
Product.hasMany(Cart,{foreignKey : 'productId'})
Cart.belongsTo(Product,{foreignKey : 'productId'})

// The Product to Cart relationship should be modeled as a many-to-many relationship 
// through a junction table (e.g., CartItem), not a hasMany or belongsTo directly.

// Needs Update because Product shouldn't have a direct hasMany relationship with Cart.
// Instead, the Cart should represent a many-to-many relationship between Product and User
//  (since a product can be in many carts, and a cart can contain many products).

// Cart.belongsToMany(Product, { through: 'CartItem', foreignKey: 'cartId' });
// Product.belongsToMany(Cart, { through: 'CartItem', foreignKey: 'productId' });

//cartItem Model
// const CartItem = sequelize.define('CartItem', {
//     quantity: { type: Sequelize.INTEGER, defaultValue: 1 },
    // other fields as needed (e.g., price, total price, etc.)
//   });    


//order and OrderDetail relationship
Order.hasMany(OrderDetail,{foreignKey : 'orderId'})
OrderDetail.belongsTo(Order,{foreignKey : 'orderId'})

//order details and product relationship
Product.hasMany(OrderDetail,{foreignKey : 'productId'})
OrderDetail.belongsTo(Product,{foreignKey : 'productId'})

//order and payment relationship

//One Payment can have one associated Order
// (e.g., a customer makes a single payment for an order).
//The Order table has a foreignKey (paymentId) that references the Payment table's primary key (id).

//This is appropriate when each payment corresponds to one order, and the primary identifier 
// is the Payment. For example, you want to track orders through payment IDs.
Payment.hasOne(Order,{foreignKey : 'paymentId'})
Order.belongsTo(Payment,{foreignKey : 'paymentId'})


// most followed approach
//One Order can have one associated Payment 
// (e.g., a customer places an order and then makes a single payment for that order).

//The Payment table has a foreignKey (orderId) that references the Order table's primary key (id).
//This is suitable when each order will have exactly one corresponding payment and
//  you want the Payment table to reference the Order table.
// Order.hasOne(Payment,{foreignKey : 'orderId'})
// Payment.belongsTo(Order,{foreignKey : 'orderId'})

//order-user relationship
User.hasMany(Order,{foreignKey : 'userId'})
Order.belongsTo(User,{foreignKey : 'userId'})



  

//exporting the sequelize 

export default sequelize