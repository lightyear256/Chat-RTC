import { AuthenticatorRequest } from "../middleware/userMiddleware";
import {Response}from 'express';
import { MessagesModel, RoomsModel } from "../models/model";

export const Creator=async(req:AuthenticatorRequest,res:Response)=>{
    const userId=req.user?.userId;
    const roomId=req.body.roomId;

    try{
        await RoomsModel.create({
            hash:roomId
        })
        res.send({
            success:true,
            msg:"room Created successfully"
        })
    }catch(e){
        res.status(500).send({
            success:false,
            msg:"Internal server Error"
        })
    }

}
export const fetch=async(req:AuthenticatorRequest,res:Response)=>{
        const userId=req.user?.userId
        const roomId=req.query.roomId
        try {
            const room=await RoomsModel.findOne({
                hash:roomId
            })
            if(!room){
                res.send({
                    success:false,
                    msg:"room not found"
                })
                return
            }
            const messages=await MessagesModel.find({
                roomId:room._id
            }).populate([
                {path:"from" ,select:"_id name"},
                {path:"roomId",select:"hash"}
            ])
            console.log(messages);
            const fetchMessages=[];
            for(let i=0;i<messages.length;i++){
                const sender = messages[i].from as unknown as { _id: any; name: string };
                const data={
                    messages:messages[i].message,
                    from:sender.name,
                    type:sender._id.toString()===userId?.toString()?"sender":"receiver"
                }
                fetchMessages.push(data);
            }
            res.send({
                success:true,
                msg:"chat-fetched",
                messages:fetchMessages,
                name:req.user?.name                
            })

        } catch (error) {
            res.status(500).send({
                success:false,
                msg:"Internal server error "+error
            })
        }
}
export const Joiner=async(req:AuthenticatorRequest,res:Response)=>{
    const userId=req.user?.userId;
    const roomId=req.body.roomId;

    try {
        const room = await RoomsModel.findOneAndUpdate(
            { hash: roomId },
            { $push: { users: userId } }
        )
        if(room){
        res.send({
            success:true,
            msg:"joined chat Successfully"
        })}
        else{
            success:false
            res.send({msg:"Incorrect room"})
        }
        
    } catch (error) {
        res.status(500).send({
            success:false,
            msg:"Internaln server error"
        })
    }

}