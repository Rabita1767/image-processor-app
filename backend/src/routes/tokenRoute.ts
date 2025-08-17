import Router from "express";
import tokenController from "../controllers/tokenController";
const router = Router();
router.post("/getAccessToken", tokenController.getAccessToken);
export default router;
