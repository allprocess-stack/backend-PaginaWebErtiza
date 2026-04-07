import { Router } from "express";
import { forgotPassword } from "../controllers/forgotpassword.controllers";

const router = Router();

router.post("/", forgotPassword);

export default router;