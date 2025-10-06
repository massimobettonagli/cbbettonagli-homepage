// lib/socket.ts
import { io, Socket } from "socket.io-client";

const URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

let socket: Socket | null = null;

if (typeof window !== "undefined") {
  socket = io(URL, {
    path: "/api/socket", // deve combaciare con pages/api/socket.ts
    autoConnect: false,
    transports: ["websocket"],
  });
}

export default socket!;