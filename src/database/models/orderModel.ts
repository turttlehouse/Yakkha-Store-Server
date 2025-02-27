import {
    Table,
    Column,
    Model,
    DataType,
} from 'sequelize-typescript';

// decorator is used to define the metadata for the model clas
@Table({
    tableName: 'orders',
    modelName: 'Order',
    timestamps: true,
})

//User model
// Model class: used to define the structure of the table
//  All Sequelize models extend this class, which provides methods like findAll, findOne, create, update, and destroy.
class Order extends Model{
    @Column({
        primaryKey : true,
        type : DataType.UUID,
        defaultValue : DataType.UUIDV4,
    })
    // TypeScript declare keyword used to declare the type of a property
    declare id : string;

    @Column({
        type : DataType.STRING,
        allowNull : false,
        validate :{
            len :{
                args : [10,10], //args : [min,max]
                msg : "Phone number must be 10 characters long"
            }
        }
    })
    declare phoneNumber : string;

    @Column({
        type : DataType.STRING,
        allowNull : false
    })

    declare shippingAddress : string;

    @Column({
        type : DataType.INTEGER,
        allowNull : false
    })

    declare totalAmount : Number;

    @Column({
        type : DataType.ENUM('pending','completed','cancelled','delivered','ontheway','preparation'),
        defaultValue : 'pending'
    })

    declare orderStatus : string;

}

export default Order;

