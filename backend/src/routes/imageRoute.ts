import express from "express";
import imageController from "../controllers/imageController";
import authMiddleware from "../middlewares/authMiddleware";
import { upload } from "../config/multer";
const router = express.Router();
// router.post("/upload-and-compress",authMiddleware.auth,upload.single("image"),imageController.compressImageUpdatedAsGuest);
router.post(
  "/download/:id",
  authMiddleware.auth,
  imageController.downloadProcessedImage
);
router.get("/:id", authMiddleware.auth, imageController.getImageById);
export default router;
