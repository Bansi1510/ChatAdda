import { Server } from "socket.io"
import User from "../models/user.model";
import Message from "../models/message.model";
import http from "http"

//to store online user and socketId
const onlineUser = new Map();

//to track typing status [conversation]:boolean (both user userId)
const typingUser = new Map();

const initializeSocket = (server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>) => {
  const client_url = process.env.CLIENT_URL as string;
  const io = new Server(server, {
    cors: {
      origin: client_url,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    },
    pingTimeout: 60000,//disconnect after 60s when user offline
  })

  //new socket creation
  io.on("connection", (socket) => {

    console.log(socket.id)
    console.log(`user connected :${socket.id}`);
    let userId: string | null = null;

    //mark user as online

    socket.on("user_connected", async (connectedUserId) => {
      try {
        userId = connectedUserId;
        onlineUser.set(userId, socket.id);
        if (userId) socket.join(userId)// join a personal room for direct emits  

        await User.findByIdAndUpdate(userId, {
          isOnline: true,
          lastSeen: new Date()
        })

        //notify all user that this user is now online
        io.emit("user_status", { userId, isOnline: true })
      } catch (error) {
        console.error("socket problem : ", error)
      }
    })

    //return online status of requested user
    socket.on("get_user_status", (requestedUserId, callback) => {
      const isOnline = onlineUser.has(requestedUserId);
      callback({
        userId: requestedUserId,
        isOnline,
        lastSeen: isOnline ? new Date() : null
      })
    })

    //forward  message to receiver if online

    socket.on("send_message", async (message) => {
      try {
        const receiverSocketId =
          onlineUser.get(
            message.receiver._id.toString()
          );

        console.log(
          "receiver socket:",
          receiverSocketId
        );

        if (receiverSocketId) {
          io.to(receiverSocketId).emit(
            "receive_message",
            message
          );

          console.log(
            "message emitted realtime"
          );
        }
      } catch (error) {
        console.error(
          "sending message problem : ",
          error
        );

        socket.emit("message_error", {
          error: "Failed to send message",
        });
      }
    });

    //update message as read  and notify sender

    socket.on("message_read", async ({ messageIds, senderId }) => {
      try {
        await Message.updateMany(
          {
            _id: { $in: messageIds }
          },
          {
            $set: {
              messageStatus: "read"
            }
          }
        );

        const senderSocketId = onlineUser.get(senderId);

        if (senderSocketId) {
          messageIds.forEach((messageId: string) => {
            io.to(senderSocketId).emit(
              "message_status_update",
              {
                messageId,
                messageStatus: "read"
              }
            );
          });
        }
      } catch (error) {
        console.log(
          "message status read error : ",
          error
        );
      }
    });

    //typing status update

    socket.on("typing_start", async ({ conversationId, receiverId }) => {
      if (!userId || !conversationId || !receiverId) return;

      if (!typingUser.has(userId)) typingUser.set(userId, {});

      const userTyping = typingUser.get(userId);

      userTyping[conversationId] = true;

      //clear any existing timeout
      if (userTyping[`${conversationId}_timeout`]) clearTimeout(userTyping[`${conversationId}_timeout`]);

      //auto stop after 2 seconds

      userTyping[`${conversationId}_timeout`] = setTimeout(() => {
        userTyping[conversationId] = false,
          socket.to(receiverId).emit("user_typing", {
            userId, conversationId, isTyping: false
          })
      }, 2000);

      //notify receiver

      socket.to(receiverId).emit("user_typing", {
        userId,
        conversationId,
        isTyping: true
      })

    })

    socket.on("typing_stop", ({ conversationId, receiverId }) => {
      if (!userId || !conversationId || !receiverId) return;

      if (typingUser.has(userId)) {
        const userTyping = typingUser.get(userId);
        userTyping[conversationId] = false;

        if (userTyping[`${conversationId}_timeout`]) {
          clearTimeout(userTyping[`${conversationId}_timeout`]);
          delete userTyping[`${conversationId}_timeout`];
        }
      }

      socket.to(receiverId).emit("user_typing", {
        userId,
        conversationId,
        isTyping: false
      })
    });

    //reactions 

    socket.on("add_reaction", async ({ messageId, emoji, reactionUserId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) return;

        const exitingIndex = message.reactions.findIndex((r) => r.user.toString() === reactionUserId);

        if (exitingIndex > -1) {
          const exiting = message.reactions[exitingIndex];
          if (exiting.emoji == emoji) {
            //remove 
            message.reactions.splice(exitingIndex, 1);
          } else {
            //change emoji
            message.reactions[exitingIndex].emoji = emoji;
          }
        } else {
          //add reaction 
          message.reactions.push({ user: reactionUserId, emoji })
        }
        await message.save();

        const populatedMessage = await Message.findOne({ _id: message._id })
          .populate("sender", "username profilePictures")
          .populate("receiver", "username profilePictures")
          .populate("reactions.user", "username")

        const reactionUpdated = {
          messageId,
          reactions: populatedMessage?.reactions
        }

        const senderSocket = onlineUser.get(populatedMessage?.sender._id.toString());
        const receiverSocket = onlineUser.get(populatedMessage?.receiver?._id.toString());

        if (senderSocket) io.to(senderSocket).emit("reaction_update", reactionUpdated);

        if (receiverSocket) io.to(receiverSocket).emit("reaction_update", reactionUpdated);
      } catch (error) {
        console.log("rection socket error : ", error);
      }
    })
    //handle disconnection and mark us offline

    const hindleDissconnected = async () => {
      if (!userId) return;

      try {
        onlineUser.delete(userId);

        //clear all typing timesouts
        if (typingUser.has(userId)) {
          const userTyping = typingUser.get(userId);
          Object.keys(userTyping).forEach((key) => {
            if (key.endsWith('_timeout')) clearTimeout(userTyping[key]);
          })

          typingUser.delete(userId);
        }
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: new Date()
        });

        io.emit("user_status", {
          userId, isOnline: false,
          lastSeen: new Date()
        });

        socket.leave(userId);
      } catch (error) {
        console.log("disconnection error : ", error);
      }
    }
    //disconnect socket

    socket.on("disconnect", hindleDissconnected);

    // attach the online user map to the socket server for external  user

  });
  const socketUserMap: Map<string, string> = onlineUser;

  return io;

}

export default initializeSocket;