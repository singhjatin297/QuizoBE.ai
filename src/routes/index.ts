import { Router } from "express";
import quizRoutes from "./quiz.js";

const router = Router();

router.use("/quiz", quizRoutes);

export default router;
