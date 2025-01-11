import {
    Table,
    Column,
    Model,
    DataType,
} from 'sequelize-typescript';

// decorator is used to define the metadata for the model clas
@Table({
    tableName: 'carts',
    modelName: 'Cart',
    timestamps: true,
})

//User model
// Model class: used to define the structure of the table
//  All Sequelize models extend this class, which provides methods like findAll, findOne, create, update, and destroy.
class Cart extends Model{
    @Column({
        primaryKey : true,
        type : DataType.UUID,
        defaultValue : DataType.UUIDV4,
    })
    // TypeScript declare keyword used to declare the type of a property
    declare id : string;

    @Column({
        type : DataType.INTEGER,
    })
    declare quantity : number;

}

export default Cart;

