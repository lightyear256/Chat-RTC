import { Router } from "express";
import { userMiddleware } from "../middleware/userMiddleware";
import { Creator, fetch, Joiner } from "../controller/roomController";

export const roomRouter=Router();
roomRouter.use(userMiddleware);
roomRouter.post("/create",Creator);
roomRouter.post("/join",Joiner);
roomRouter.get("/fetcher",fetch);
