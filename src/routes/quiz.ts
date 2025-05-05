import { RequestHandler, Router } from "express";
import { addQuestion, createQuiz } from "../controller/quizController.js";

const router = Router();

router.post("/createQuiz", createQuiz);
router.post("/addQuestion", addQuestion);

export default router;
