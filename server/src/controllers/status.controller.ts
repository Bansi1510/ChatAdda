import { Request, Response } from "express";
import { uploadToCloudinary } from "../config/upload";
import response from "../utils/responseHandler";
import Status from "../models/status.model";

export const createStatus = async (req: Request, res: Response) => {
  try {
    const { content, contentType } = req.body;
    const senderId = req.user.userId;

    const file = req.file;
    let mediaUrl = null;
    let finalContentType = contentType || "text"

    if (file) {
      const uploadFileUrl = await uploadToCloudinary(file.path);
      if (!uploadFileUrl) {
        return response(res, 400, 'unable to share file')
      }
      mediaUrl = uploadFileUrl;
      if (file.mimetype.startsWith('image')) finalContentType = 'image';
      else if (file.mimetype.startsWith('video')) finalContentType = 'video'
      else return response(res, 400, 'only image and video allowed');

    } else if (content?.trim()) finalContentType = 'text';
    else return response(res, 400, 'enter message first');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const status = new Status({
      user: senderId,
      content: mediaUrl || content,
      contentType: finalContentType,
      expiresAt
    })

    await status.save();

    const populateStatus = await Status.findOne(status._id).
      populate("user", "username profilePictures").
      populate("viewers", "username profilePictures");

    //socket 
    if (req.io && req.socketUserMap) {
      //show status to all user
      for (const [connectedUserId, socketId] of req.socketUserMap) {
        if (connectedUserId !== senderId) {
          req.io.to(socketId).emit("new_status", populateStatus);
        }
      }
    }

    return response(res, 201, "status created", populateStatus);
  } catch (error) {
    console.error(error);
    return response(res, 500, "Internal server error");
  }
}

export const getStatuses = async (req: Request, res: Response) => {
  try {
    const all = await Status.find();
    console.log(all);
    const statuses = await Status.find({
      expiresAt: { $gt: new Date() }
    }).populate("user", "username profilePictures").
      populate("viewers", "username profilePictures").sort({ createdAt: -1 });
    console.log(statuses)

    return response(res, 200, "status retrived successfully", statuses)
  } catch (error) {
    console.error(error);
    return response(res, 500, "Internal server error");
  }
}

export const viewStatus = async (req: Request, res: Response) => {
  try {
    const { statusId } = req.params;
    const userId = req.user.userId;

    const status = await Status.findById(statusId);
    if (!status) return response(res, 404, 'status not found');

    if (!status.viewers.includes(userId)) {
      status.viewers.push(userId);
      await status.save();

      const updateStatus = await Status.findById(statusId).
        populate("user", "username profilePictures").
        populate("viewers", "username profilePictures")

      //socket

      if (req.io && req.socketUserMap) {
        //show status
        const statusOwnerStatusId = req.socketUserMap.get(status.user._id.toString());
        if (statusOwnerStatusId) {
          const viewStatusData = {
            statusId,
            viewerId: userId,
            totalViewers: updateStatus?.viewers.length,
            viewers: updateStatus?.viewers
          }
          req.io.to(statusOwnerStatusId).emit("view_status", viewStatusData)
        } else {
          console.log("status owner not connected ")
        }
      }
    } else {
      console.log("status view already")
    }
    return response(res, 200, 'status viewed');
  } catch (error) {
    console.error(error);
    return response(res, 500, "Internal server error");
  }
}

export const deleteStatus = async (req: Request, res: Response) => {
  try {
    const { statusId } = req.params;
    const userId = req.user.userId;
    const status = await Status.findById(statusId);
    if (!status) return response(res, 404, 'status not found');

    if (status.user.toString() != userId) {
      return response(res, 401, "you are not autheticated")
    }

    await status.deleteOne();

    //socket

    if (req.io && req.socketUserMap) {
      for (const [connectedUserId, socketId] of req.socketUserMap) {
        if (connectedUserId !== userId) {
          req.io.to(socketId).emit("status_delete", statusId);
        }
      }
    }

    return response(res, 200, 'status  deleted ');
  } catch (error) {
    console.error(error);
    return response(res, 500, "Internal server error");
  }
}