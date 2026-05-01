import { Server } from "socket.io";

declare module "socket.io" {
  interface Server {
    socketUserMap: Map<string, string>;
  }
}