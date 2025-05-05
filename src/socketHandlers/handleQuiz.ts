import { Socket, Server } from "socket.io";
import { quizzes, usersArr } from "../data/quizData.js";
import { users } from "../users.js";

export const registerChatHandler = (io: Server, socket: Socket) => {
  socket.on("start quiz", (id: number) => {
    const quiz = quizzes.find((item) => item.id === id);
    if (quiz) {
      quiz.isActive = true;
    } else {
      console.error("Not valid Quiz Id or Quiz not found");
    }
  });

  socket.on(
    "join quiz",
    ({ username, quizId }: { username: string; quizId: number }) => {
      const quiz = quizzes.find(
        (quiz) => quiz.id === quizId && quiz.isActive === true
      );
      if (!quiz) {
        socket.emit("quiz error", {
          message: "No active quiz found with the provided ID",
        });
        return;
      }

      const cleanUsername = username.trim();

      if (
        usersArr.some(
          (user) => user.username === cleanUsername && user.quizId === quizId
        )
      ) {
        socket.emit("quiz error", {
          message: "You are already joined in this quiz",
        });
        return;
      }

      socket.data.username = cleanUsername;
      socket.data.quizId = quizId;

      usersArr.push({ username: cleanUsername, quizId });

      socket.emit("quiz joined", {
        message: "Successfully joined the quiz",
        quizId,
      });

      const room = `quiz-${quizId}`;
      socket.join(room);
      socket.broadcast
        .to(room)
        .emit("user joined", { username: cleanUsername, quizId });
    }
  );
};
