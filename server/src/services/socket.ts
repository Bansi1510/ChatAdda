import { Server } from "socket.io"
import User from "../models/user.model";


//to store online user and socketId
const onlineUser = new Map();

//to track typing status [conversation]:boolean (both user userId)
const typingUser = new Map();

const initializeSocket = (server: number) => {
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
    console.log(`user connected :${socket.id}`);
    let userId = null;

    //mark user as online

    socket.on("user_connected", async (connectedUserId) => {
      try {
        userId = connectedUserId;
        onlineUser.set(userId, socket.id);
        socket.join(userId)// join a personal room for direct emits  

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
        const receiverId = onlineUser.get(message?._id);
        if (receiverId) io.to(receiverId).emit("receiver_message", message);
      } catch (error) {
        console.error("sending message problem : ", error)
      }
    })


  })
}