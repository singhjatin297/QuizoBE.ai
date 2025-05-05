import { Socket } from "socket.io";

export const registerAuthHandler = (socket: Socket) => {
  socket.on("logout", () => {
    console.log(`User ${socket.data.user.username} logged out`);
    socket.disconnect();
  });
};
