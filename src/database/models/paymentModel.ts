import {
    Table,
    Column,
    Model,
    DataType,
} from 'sequelize-typescript';

// decorator is used to define the metadata for the model clas
@Table({
    tableName: 'payments',
    modelName: 'Payment',
    timestamps: true,
})

//User model
// Model class: used to define the structure of the table
//  All Sequelize models extend this class, which provides methods like findAll, findOne, create, update, and destroy.
class Payment extends Model{
    @Column({
        primaryKey : true,
        type : DataType.UUID,
        defaultValue : DataType.UUIDV4,
    })
    // TypeScript declare keyword used to declare the type of a property
    declare id : string;

    @Column({
        type : DataType.ENUM('cod','khalti','esewa'),
        allowNull : false
    })
    declare paymentMethod : string;

    @Column({
        type : DataType.ENUM('paid','unpaid'),
        defaultValue : 'unpaid'
    })

    declare paymentStatus : string;

    //After payment is done, we will store the transaction id
    @Column({
        type : DataType.STRING,
        // allowNull : false
    })

    declare pidx : string;

}

export default Payment;

