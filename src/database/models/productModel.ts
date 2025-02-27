import {
    Table,
    Column,
    Model,
    DataType,
} from 'sequelize-typescript';

// decorator is used to define the metadata for the model clas
@Table({
    tableName: 'products',
    modelName: 'Product',
    timestamps: true,
})

//User model
// Model class: used to define the structure of the table
//  All Sequelize models extend this class, which provides methods like findAll, findOne, create, update, and destroy.
class Product extends Model{
    @Column({
        primaryKey : true,
        type : DataType.UUID,
        defaultValue : DataType.UUIDV4,
    })
    // TypeScript declare keyword used to declare the type of a property
    declare id : string;

    @Column({
        type : DataType.STRING,
        allowNull : false
    })
    declare productName : string;

    @Column({
        type : DataType.TEXT,
    })
    declare productDescription : string;

    @Column({
        type : DataType.INTEGER,
    })
    declare productPrice : number;

    @Column({
        type : DataType.INTEGER,
    })
    declare productTotalStockQty : number;  

    @Column({
        type : DataType.STRING,
    })
    declare productImageUrl : string;
}

export default Product;

