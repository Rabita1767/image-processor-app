import express from "express";
import userController from "../controllers/userController";
import {
  loginValidator,
  signupValidator,
} from "../middlewares/validators/userValidator";
import { validateRequest } from "../middlewares/validators/validateRequest";
const router = express.Router();
router.post("/signup", signupValidator, validateRequest, userController.signup);
router.post("/login", loginValidator, validateRequest, userController.login);
export default router;
