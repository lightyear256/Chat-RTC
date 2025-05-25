import { Router } from "express";
import { Signin, Signup } from "../controller/userContoller";

export const userRouter=Router();

userRouter.post("/signup",Signup),
userRouter.post("/signin",Signin)