import { Socket, Server } from "socket.io";
import { questionsArr, quizzes, usersArr } from "../data/quizData.js";

export const registerChatHandler = (io: Server, socket: Socket) => {
  socket.on("start quiz", (quizId: number) => {
    const quiz = quizzes.find((item) => item.id === quizId);

    if (!quiz) {
      socket.emit("quiz start error", {
        message: "Not valid Quiz Id or Quiz not found",
      });
      return;
    }

    quiz.isActive = true;

    const questions = questionsArr.filter((item) => item.quizId === quizId);

    let currentQuestion = 0;
    const room = `quiz-${quizId}`;

    function sendNextQuestion() {
      if (currentQuestion >= questions.length) {
        io.to(room).emit("quiz ended", { message: "Quiz completed" });
        return;
      }

      const question = questions[currentQuestion];
      io.to(room).emit("current question", {
        currentQuestion: question,
        timeLimit: 30,
      });

      currentQuestion++;

      setTimeout(sendNextQuestion, 30000);
    }

    sendNextQuestion();
  });

  socket.on("next question", (quizId: number) => {
    const quiz = quizzes.find((item) => item.id === quizId);
    if (!quiz) {
      socket.emit("next question error", {
        message: "Not valid Quiz Id or Quiz not found",
      });
      return;
    }

    if (!quiz.isActive) {
      socket.emit("next question error", {
        message: "Not an active Quiz",
      });
      return;
    }
    const questions = questionsArr.filter((item) => item.quizId === quizId);

    let currentQuestion = 1;

    const sendNextQuestion = () => {
      if (questions.length < currentQuestion) {
        currentQuestion++;
      }
    };

    setTimeout(() => {
      sendNextQuestion();
    }, 30000);

    io.to(`quiz-${quizId}`).emit("current question", {
      currentQuestion: questions[currentQuestion],
      timeLimit: 30,
    });
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
