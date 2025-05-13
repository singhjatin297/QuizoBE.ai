import { Request, Response } from "express";
import {
  addQuestionService,
  createQuizService,
} from "../service/quizService.js";

interface CreateQuizPayload {
  title: string;
  isActive: boolean;
  status: "waiting" | "active" | "ended";
}

interface AddQuestionPayload {
  quizId: number;
  question: string;
  answer: string;
  options: string[];
}

export const createQuiz = (
  req: Request<{}, {}, CreateQuizPayload>,
  res: Response
): void => {
  const { title, isActive, status } = req.body;

  if (!title) {
    res.status(400).json({ error: "Missing fields" });
    return;
  }

  const quiz = createQuizService(title, isActive, status);
  res.status(201).json({ message: "Quiz created", quiz });
};

export const addQuestion = (
  req: Request<{}, {}, AddQuestionPayload>,
  res: Response
): void => {
  const { quizId, question, answer, options } = req.body;

  if (!question || !answer || !options) {
    res.status(400).json({ error: "Missing fields" });
    return;
  }

  const sawal = addQuestionService(quizId, question, answer, options);
  res.status(201).json({ message: "Quiz created", sawal });
};
