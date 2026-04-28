import { Request, Response } from "express";
import Conversation from "../models/conversation.model";
import { uploadToCloudinary } from "../config/upload";
import response from "../utils/responseHandler";
import Message from "../models/message.model";

export const chatMessageSend = async (req: Request, res: Response) => {
  try {
    const { receiverId, content, messageStatus } = req.body;
    const file = req.file;
    const senderId = req.user.userId;
    const participants = [senderId, receiverId].sort();

    let conversation = await Conversation.findOne({ participants: participants });

    if (!conversation) {
      conversation = new Conversation({ participants });
      await conversation.save();
    }

    let imageOrVideoUrl = null;
    let contentType = null;

    if (file) {
      const uploadFileUrl = await uploadToCloudinary(file.path);
      if (!uploadFileUrl) {
        return response(res, 400, 'unable to share file')
      }
      imageOrVideoUrl = uploadFileUrl;
      if (file.mimetype.startsWith('image')) contentType = 'image';
      else if (file.mimetype.startsWith('video')) contentType = 'video'
      else return response(res, 400, 'only image and video allowed');

    } else if (content?.trim()) contentType = 'text';
    else return response(res, 400, 'enter message first');

    const message = new Message({
      conversation: conversation._id,
      sender: senderId,
      receiver: receiverId,
      content,
      contentType,
      imageOrVideoUrl,
      messageStatus
    })

    await message.save();

    if (message?.content) conversation.lastMessage = message?._id;

    conversation.unreadCount += 1;
    await conversation.save();

    const populateMessage = await Message.findOne(message._id).
      populate("sender", "username profilePictures").
      populate("receiver", "username profilePictures");


    //socket later

    return response(res, 201, "message send", populateMessage);
  } catch (error) {
    console.error(error);
    return response(res, 500, "Internal server error");
  }
}

export const getAllConversation = async (req: Request, res: Response) => {
  const userId = req.user.userId;
  try {
    let conversations = await Conversation.find({ participants: userId }).
      populate("participants", "username profilePictures isOnline lastSeen").
      populate({
        path: "lastMessage",
        populate: {
          path: "sender receiver",
          select: "username profilePictures"
        }
      }).sort({ updatedAt: -1 });
    return response(res, 201, "conversaction get successfully", conversations);
  } catch (error) {
    console.error(error);
    return response(res, 500, "Internal server error");
  }
}


export const getMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) return response(res, 404, 'this message not found');

    if (!conversation.participants.includes(userId)) return response(res, 401, 'you are not autheticated');

    const message = await Message.find({ conversation: conversationId }).
      populate("sender", "username profilePictures").
      populate("receiver", "username profilePictures").
      sort("createdAt");

    await Message.updateMany({
      conversation: conversationId,
      receiver: userId,
      messageStatus: { $in: ["send", "delivered"] }
    }, { $set: { messageStatus: "read" } }
    )

    conversation.unreadCount = 0;
    await conversation.save();

    return response(res, 200, "message retrived", message);
  } catch (error) {
    console.error(error);
    return response(res, 500, "Internal server error");
  }
}

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { messageIds } = req.body;
    const userId = req.user.userId;

    let message = await Message.find({
      _id: { $in: messageIds }, receiver: userId
    })

    await Message.updateMany({
      _id: { $in: messageIds },
      receiver: userId,
    }, {
      $set: { messageStatus: "read" }
    });
    //socket.io
    return response(res, 200, "message read", message);
  } catch (error) {
    console.error(error);
    return response(res, 500, "Internal server error");
  }
}

export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.userId;

    const message = await Message.findById(messageId);
    if (!message) return response(res, 404, "message not found");

    if (message.sender.toString() != userId) {
      return response(res, 401, "you are not autheticated")
    }

    await message.deleteOne();

    //socket.id

    return response(res, 200, "message deleted");
  } catch (error) {
    console.error(error);
    return response(res, 500, "Internal server error");
  }
}