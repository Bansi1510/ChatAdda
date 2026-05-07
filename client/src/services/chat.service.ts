import { io, Socket } from "socket.io-client"
import useUserStore from "../store/useUserStore";



let socket: Socket | null = null;

export const initializeSocket = () => {
  if (socket) return socket;

  const user = useUserStore.getState().user as { _id: string } | null;
  if (!user) throw new Error('please check network')
  const BACKEND_URL = import.meta.env.VITE_API_URL as string;

  socket = io(BACKEND_URL, {
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });

  //socket connect
  socket.on("connection", () => {
    console.log("socket id in frontned : ", socket?.id);
    socket?.emit("user_connected", user._id)
  })

  socket.on("connect_error", (error) => {
    console.log(error);
  });

  //socket disconnect

  socket.on("disconnect", (res) => {
    console.log(res)
  })

  return socket;
}

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
}


export const disconnetSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null
  }
}