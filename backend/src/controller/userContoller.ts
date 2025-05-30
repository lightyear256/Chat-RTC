import { Request, Response } from "express";
import { UserModel } from "../models/model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import z from "zod";
import dotenv, { config } from "dotenv";
import path from "path";
import { userSignInSchema, userSignUpSchema } from '../schema/UserSchema';
dotenv.config({
  path: path.resolve(__dirname, "../../env"), // Adjust relative to compiled build location
});
type User = z.infer<typeof userSignUpSchema>;
export const Signup = async (req: Request, res: Response) => {
  try {
    const result = userSignUpSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).send({
        msg: result.error.flatten(),
      });
      return;
    }
    const { email, password, name }: User = result.data;

    try {
      const user = await UserModel.findOne({
        email: email,
      });
      if (!user) {
        const hashedpass = await bcrypt.hash(password, 10);
        await UserModel.create({
          email,
          password: hashedpass,
          name,
        });
        res.status(200).send({
          msg: "data added successfully",
        });
      } else {
        res.status(411).send({
          msg: "user already exits",
        });
      }
    } catch (error) {
      res.status(500).send({
        msg: "internal server error",
      });
    }
  } catch (e) {
    res.status(500).send({
      msg: "internal server error",
    });
  }
};

export const Signin = async (req: Request, res: Response) => {
  const result = userSignInSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).send({
      msg: result.error.flatten(),
    });
    return;
  }
  const { email, password } = result.data;
  try {
    const user = await UserModel.findOne({
      email: email,
    });
    if (!user) {
      res.send({
        msg: "user not found",
      });
      return;
    }
    const success = await bcrypt.compare(password, user.password);
    if (!success) {
      res.status(403).send({
        msg: "Either Email or Password is Incorrect",
      });
      return;
    }
    const token = jwt.sign(
      { userId: user._id, email: email,name:user.name},
      process.env.JWT_SECRET_USER as string,
      { expiresIn: "24h" }
    );
    res.send({
      msg: "login successful",
      token: token,
    });
  } catch (error) {
    res.status(500).send({
      msg: "Internal server error",
    });
  }
};
