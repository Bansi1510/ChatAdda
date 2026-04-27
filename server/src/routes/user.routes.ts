import express, { Router } from "express";
import { sendOtp, verifyOtp } from "../controllers/user.controller";

const userRouter: Router = express.Router();


userRouter.post("/send-otp", sendOtp);
userRouter.post('/verify-otp', verifyOtp);

export default userRouter;