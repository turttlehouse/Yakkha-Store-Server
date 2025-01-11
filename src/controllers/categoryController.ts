import Category from "../database/models/categoryModel"

class CategoryController{
    categoryData = [
        {
            categoryName : 'Electronics',
        },
        {
            categoryName : 'Clothing',
        },
        {
            categoryName : 'Footwear',
        },
        {
            categoryName : 'Food/Bevarages',
        }
    ]
    async seedCategory(): Promise<void>{
        const datas = await Category.findAll();
        if(datas.length === 0){
            const data = await Category.bulkCreate(this.categoryData);
            console.log('category seeded successfully');
        }
        else{
            console.log('category already seeded');
        }

    }

}

export default new CategoryController();