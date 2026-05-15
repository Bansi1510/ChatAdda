import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initializeSocket = (userId: string) => {
  // Return existing socket regardless of connection state — prevents double-socket race condition
  if (socket) return socket;

  const BACKEND_URL =
    import.meta.env.VITE_API_URL as string;

  socket = io(BACKEND_URL, {
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log(
      "socket connected:",
      socket?.id
    );

    socket?.emit(
      "user_connected",
      userId
    );
  });

  socket.on("connect_error", (err) => {
    console.log(
      "socket error:",
      err.message
    );
  });

  socket.on("disconnect", (reason) => {
    console.log(
      "socket disconnected:",
      reason
    );
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};