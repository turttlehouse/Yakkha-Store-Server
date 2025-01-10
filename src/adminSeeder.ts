import User from "./database/models/userModel"
import bcrypt from 'bcrypt';

const adminSeeder = async():Promise<void> => {

    const [data] = await User.findAll({
        where :{
            email : 'helloadmin@gmail.com',
            role : 'admin'
        }
    })

    if(!data){
        const adminPassword : string = process.env.ADMIN_PASSWORD || ''
        // if (!adminPassword || !process.env.ADMIN_USERNAME || !process.env.ADMIN_EMAIL || !process.env.ADMIN_ROLE) {
        //     throw new Error('Admin environment variables are not set properly');
        // }

        await User.create({
            username : process.env.ADMIN_USERNAME,
            email : process.env.ADMIN_EMAIL,
            role : process.env.ADMIN_ROLE,
            password : bcrypt.hashSync(adminPassword,8)
        })
        console.log('admin seeded successfully');
    }
    else{
        console.log('admin already exists');
    }

}

export default adminSeeder;