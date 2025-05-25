import express from 'express';
import { userRouter } from './routes/userRouter';
import { roomRouter } from './routes/roomRouter';
import cors from 'cors';
export const app=express();
app.use(express.json());

app.use(cors({
  origin: "*", // or your frontend domain
  credentials: true
}));

app.use('/user',userRouter)
app.use("/room",roomRouter)

