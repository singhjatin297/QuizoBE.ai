import { Socket, Server } from "socket.io";

export const registerChatHandler = (io: Server, socket: Socket) => {
  socket.on("chat message", (message: string) => {
    console.log(`[${socket.data.user.username}]: ${message}`);

    io.emit("chat message", {
      user: socket.data.user.username,
      message: message,
    });
  });

  socket.on(
    "private message",
    ({ message, userId }: { message: string; userId: number }) => {
      console.log(`[${socket.data.user.username}]: ${message}`);
      const socketById = findSocketByUserId(io, userId);

      if (!socketById) {
        console.log("❌ No user found with that ID");
        return;
      }

      socketById.emit("private message", {
        user: socket.data.user.username,
        message,
      });
    }
  );

  function findSocketByUserId(io: Server, userId: number): Socket | undefined {
    for (const [, socket] of io.of("/").sockets) {
      if (socket.data.user?.id === userId) {
        return socket;
      }
    }
    return undefined;
  }
};
