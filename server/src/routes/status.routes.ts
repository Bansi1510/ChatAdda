import express, { Router } from "express";
import isAuthicated from "../middlewares/isAutheticated";
import upload from "../middlewares/multer";
import { createStatus, deleteStatus, getStatuses, viewStatus } from "../controllers/status.controller";


const statusRouter: Router = express();

statusRouter.post("/", isAuthicated, upload.single("image"), createStatus);
statusRouter.get("/", isAuthicated, getStatuses);
statusRouter.put("/:statusId/view", isAuthicated, viewStatus);
statusRouter.delete("/:statusId", isAuthicated, deleteStatus);


export default statusRouter;