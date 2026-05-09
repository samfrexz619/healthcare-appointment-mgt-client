import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initSocket = (userId: string) => {
  if (socket?.connected) return;

  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000", {
    withCredentials: true,
  });

  socket.on("connect", () => {
    socket?.emit("join", userId);
  });

  socket.on("disconnect", () => {
  });
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
