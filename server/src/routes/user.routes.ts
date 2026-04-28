import express, { Router } from "express";
import { sendOtp, updateProfile, verifyOtp } from "../controllers/user.controller";
import isAuthicated from "../middlewares/isAutheticated";
import upload from "../middlewares/multer";

const userRouter: Router = express.Router();


userRouter.post("/send-otp", sendOtp);
userRouter.post('/verify-otp', verifyOtp);
userRouter.put("/update-profile", isAuthicated, upload.single("image"), updateProfile)


export default userRouter;