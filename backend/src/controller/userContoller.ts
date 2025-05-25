import { Request,Response } from 'express';
import { UserModel } from '../models/model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv, { config } from 'dotenv';
import path from 'path';
dotenv.config({
  path: path.resolve(__dirname, '../../env'), // Adjust relative to compiled build location
});
export const Signup=async(req:Request,res:Response)=>{
    try{
        const encrypt= await bcrypt.hash(req.body.password,5)
        await UserModel.create({
            email:req.body.email,
            password:encrypt,
            name:req.body.name
        })
        res.send({
            msg:"Sign Up Successfull",
            success:true
        })
    }catch(e){
        res.status(500).send({
            msg:"Internal Server Error",
            success:false
        })
    }
}

export const Signin=async(req:Request,res:Response)=>{
    try{
        const user= await UserModel.findOne({
            email:req.body.email
        })
        if(user){
            const success = await bcrypt.compare(req.body.password, user.password);
            if(success){
                res.send({
                    success:true,
                    msg:"Sign in Successfull",
                    token:jwt.sign({
                        userId:user._id,
                        email:user.email,
                        name:user.name
                    },process.env.JWT_SECRET_USER as string)
                })
            }else{
                res.status(403).send({
                    msg:"incorrect email or password",
                    success:false
                })
            }
        }
        else{
            res.send({
                msg:"user not found",
                success:false
            })
        }
    }catch(e){
        res.status(500).send({
            msg:"Internal server error "+e
        })
    }
}


