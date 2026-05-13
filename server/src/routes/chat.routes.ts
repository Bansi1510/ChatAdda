import express, { Router } from "express";
import isAuthicated from "../middlewares/isAutheticated";
import { chatMessageSend, deleteMessage, getAllConversation, getMessages, markAsRead } from "../controllers/chatMessage.controller";
import upload from "../middlewares/multer";

const chatRouter: Router = express.Router();

chatRouter.post("/send-message", isAuthicated, upload.single("media"), chatMessageSend);
chatRouter.get("/conversations", isAuthicated, getAllConversation);
chatRouter.get("/conversations/:conversationId/messages", isAuthicated, getMessages);
chatRouter.put("/message/read", isAuthicated, markAsRead);
chatRouter.delete("/message/:messageId", isAuthicated, deleteMessage);

export default chatRouter;