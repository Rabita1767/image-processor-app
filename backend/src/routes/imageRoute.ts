import express from "express";
import imageController from "../controllers/imageController";
import authMiddleware from "../middlewares/authMiddleware";
import { upload } from "../config/multer";
const router = express.Router();
router.post(
  "/uploadImage",
  authMiddleware.auth,
  upload.single("image"),
  imageController.uploadImage
);
router.post(
  "/uploadImage",
  authMiddleware.auth,
  upload.array("images"),
  imageController.bulkUploadImage
);
router.get("/download/:url", imageController.downloadProcessedImage);
router.get("/:id", authMiddleware.auth, imageController.getImageById);
router.get(
  "/get/userImages",
  authMiddleware.auth,
  imageController.getUserImages
);
router.post(
  "/compress/:imageId",
  authMiddleware.auth,
  imageController.compressImage
);
export default router;
