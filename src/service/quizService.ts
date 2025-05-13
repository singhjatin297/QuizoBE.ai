import { questionsArr, quizzes } from "../data/quizData.js";

let quizId = 1;
let questionId = 1;

export const createQuizService = (
  title: string,
  isActive: boolean,
  status: string
) => {
  const newQuiz = {
    id: quizId++,
    title,
    isActive,
    status,
  };

  quizzes.push(newQuiz);
  return newQuiz;
};

export const addQuestionService = (
  quizId: number,
  question: string,
  answer: string,
  options: string[]
) => {
  const newQuestion = {
    queId: questionId++,
    quizId,
    question,
    answer,
    options,
  };

  questionsArr.push(newQuestion);
  return newQuestion;
};
