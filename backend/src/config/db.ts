import mongoose from "mongoose";
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({
    path: path.resolve(__dirname, '../../.env'),
})
export const Connection=async()=>{
    console.log(process.env.MONGOOSE_URI as string);
    try{
        await mongoose.connect(process.env.MONGOOSE_URI as string);
        console.log("connected "+process.env.MONGOOSE_URI as string);
    }catch(e){
        console.log("Not Connected Successfully "+e);
    }
}