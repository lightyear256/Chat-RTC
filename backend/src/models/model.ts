import mongoose, { Document, Model, Schema, Types,ObjectId } from "mongoose";
import { boolean } from "zod";

interface User extends Document{
    email:string;
    password:string;
    name:string
}

interface Rooms extends Document{
    hash:String,
    users:ObjectId[]
}

interface Messages extends Document{
        from:ObjectId,
        message:String,
        roomId:ObjectId
}

const UserSchema= new Schema<User>({
    name:{type:String},
    email:{type:String,required:true},
    password:{type:String,required:true}
})

const RoomSchema= new Schema<Rooms>({
    hash:{type:String,required:true},
    users:[{type: Schema.Types.ObjectId,ref:'User'}]
})

const MessageSchema= new Schema<Messages>({
  from: { type: Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  roomId: { type: Schema.Types.ObjectId, ref: "Rooms", required: true },
})

export const UserModel:Model<User>=mongoose.model<User>("User",UserSchema);
export const RoomsModel:Model<Rooms>=mongoose.model<Rooms>("Rooms",RoomSchema);
export const MessagesModel:Model<Messages>=mongoose.model<Messages>("Messages",MessageSchema);
