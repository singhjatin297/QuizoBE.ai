import { Socket, Server } from "socket.io";
import { questionsArr, quizzes, usersArr } from "../data/quizData.js";

const WAIT_BEFORE_START = 15000;
const QUESTION_TIME_LIMIT = 30000;

function getQuizById(quizId: number) {
  return quizzes.find((item) => item.id === quizId);
}

function getQuestionsForQuiz(quizId: number) {
  return questionsArr.filter((item) => item.quizId === quizId);
}

function sendWaitingMessage(io: Server, room: string) {
  io.to(room).emit("quiz waiting", {
    message: "Quiz will start in 15 seconds",
    timeLeft: WAIT_BEFORE_START / 1000,
  });
}

function sendQuizEnd(io: Server, room: string) {
  io.to(room).emit("quiz ended", {
    message: "Quiz completed",
  });
}

function broadcastQuestion(io: Server, room: string, question: any) {
  io.to(room).emit("current question", {
    currentQuestion: question,
    timeLimit: QUESTION_TIME_LIMIT / 1000,
  });
}

function runQuiz(io: Server, quizId: number) {
  const quiz = getQuizById(quizId);
  if (!quiz) return;

  const room = `quiz-${quizId}`;
  const questions = getQuestionsForQuiz(quizId);
  let currentQuestion = 0;

  const sendNextQuestion = () => {
    if (currentQuestion >= questions.length) {
      quiz.status = "ended";
      quiz.isActive = false;
      sendQuizEnd(io, room);
      return;
    }

    const question = questions[currentQuestion];
    broadcastQuestion(io, room, question);
    currentQuestion++;

    setTimeout(sendNextQuestion, QUESTION_TIME_LIMIT);
  };

  quiz.status = "active";
  quiz.isActive = true;
  sendNextQuestion();
}

export const registerQuizHandler = (io: Server, socket: Socket) => {
  socket.on("start quiz", (quizId: number) => {
    const quiz = getQuizById(quizId);

    if (!quiz) {
      socket.emit("quiz start error", {
        message: "Invalid quiz ID or quiz not found",
      });
      return;
    }

    quiz.status = "waiting";
    quiz.isActive = false;

    const room = `quiz-${quizId}`;
    sendWaitingMessage(io, room);

    setTimeout(() => runQuiz(io, quizId), WAIT_BEFORE_START);
  });

  // socket.on("start quiz", (quizId: number) => {
  //   const quiz = quizzes.find((item) => item.id === quizId);

  //   if (!quiz) {
  //     socket.emit("quiz start error", {
  //       message: "Not valid Quiz Id or Quiz not found",
  //     });
  //     return;
  //   }

  //   quiz.status = "waiting";
  //   quiz.isActive = false;

  //   const room = `quiz-${quizId}`;
  //   io.to(room).emit("quiz waiting", {
  //     message: "Quiz will start in 15 seconds",
  //     timeLeft: 15,
  //   });

  //   setTimeout(() => {
  //     quiz.status = "active";
  //     quiz.isActive = true;

  //     const questions = questionsArr.filter((item) => item.quizId === quizId);
  //     let currentQuestion = 0;

  //     function sendNextQuestion() {
  //       if (currentQuestion >= questions.length) {
  //         quiz.status = "ended";
  //         quiz.isActive = false;
  //         io.to(room).emit("quiz ended", { message: "Quiz completed" });
  //         return;
  //       }

  //       const question = questions[currentQuestion];
  //       io.to(room).emit("current question", {
  //         currentQuestion: question,
  //         timeLimit: 30,
  //       });

  //       currentQuestion++;

  //       setTimeout(sendNextQuestion, 30000);
  //     }

  //     sendNextQuestion();
  //   }, 15000);
  // });

  socket.on(
    "join quiz",
    ({ username, quizId }: { username: string; quizId: number }) => {
      const quiz = getQuizById(quizId);

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
