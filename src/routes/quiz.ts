import { RequestHandler, Router } from "express";
import { addQuestion, createQuiz } from "../controller/quizController.js";

const router = Router();

router.route("/createQuiz").post(createQuiz);

router.route("/addQuestion").post(addQuestion);

export default router;
