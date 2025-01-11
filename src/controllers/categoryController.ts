import Category from "../database/models/categoryModel"
import { Request, Response } from 'express';

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

    async addCategory(req:Request,res:Response):Promise<void>{
        const {categoryName} = req.body;
        if(!categoryName){
            res.status(400).json({
                message:"Please provide category name"
            });
            return;
        }

        await Category.create({
            categoryName
        })

        res.status(200).json({
            message:"Category created successfully"
        });
    }

    async getCategories(req:Request,res:Response):Promise<void>{
        const data = await Category.findAll();
        if(data.length === 0){
            res.status(404).json({
                message:"No category found"
            });
            return;
        }
        res.status(200).json({
            message : 'All categories fetched successfully',
            data
        });

    }

    async getCategory(req:Request,res:Response):Promise<void>{
        const {id} = req.params;
        if(!id){
            res.status(400).json({
                message:"Please provide category id"
            });
            return;
        }
        const [data] = await Category.findAll({
            where:{
                id : id
            }
        });

        if(!data){
            res.status(404).json({
                message:"Category not found"
            });
            return;
        }
        res.status(200).json({
            message : 'Category fetched successfully',
            data
        });

    }

    async deleteCategory(req:Request,res:Response):Promise<void>{
        const {id} = req.params;
        if(!id){
            res.status(400).json({
                message:"Please provide category id"
            });
            return;
        }
        const [data] = await Category.findAll({
            where:{
                id : id
            }
        })

        if(!data){
            res.status(404).json({
                message:"Category not found"
            });
            return;
        }
        await Category.destroy({
            where:{
                id : id
            }
        })

        res.status(200).json({
            message : 'Category deleted successfully'
        });
       
    }

    async updateCategory(req:Request,res:Response):Promise<void>{
        const {id} = req.params;
        const {categoryName} = req.body;
        if(!id || !categoryName){
            res.status(400).json({
                message:"Please provide category id and name"
            });
            return;
        }
        await Category.update({categoryName},{
            where:{
                id : id
            }
        })
        res.status(200).json({
            message : 'Category updated successfully',
        })
    }

}

export default new CategoryController();