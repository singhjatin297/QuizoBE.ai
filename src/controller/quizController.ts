import { Request, Response } from "express";
import {
  addQuestionService,
  createQuizService,
} from "../service/quizService.js";

export const createQuiz = (req: Request, res: Response): void => {
  const { title, isActive } = req.body;

  if (!title) {
    res.status(400).json({ error: "Missing fields" });
    return;
  }

  const quiz = createQuizService(title, isActive);
  res.status(201).json({ message: "Quiz created", quiz });
};

export const addQuestion = (req: Request, res: Response): void => {
  const { quizId, question, answer, options } = req.body;

  if (!question || !answer || !options) {
    res.status(400).json({ error: "Missing fields" });
    return;
  }

  const sawal = addQuestionService(quizId, question, answer, options);
  res.status(201).json({ message: "Quiz created", sawal });
};
