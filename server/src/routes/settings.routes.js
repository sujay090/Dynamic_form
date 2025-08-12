import { Router } from "express";
import {
  getSettings,
  updateHeaderSettings,
  updateBodySettings,
  updateFooterSettings,
  updateThemeSettings,
  getAllSettings,
  deleteSettings,
} from "../controllers/settings.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Get global settings
router.route("/").get(getSettings);

// Update specific sections with file upload support
router.route("/header").patch(upload.single("logo"), updateHeaderSettings);

router.route("/body").patch(
  upload.fields([
    { name: "heroBackgrounds", maxCount: 10 }, // Changed to support multiple hero images
    { name: "aboutImage", maxCount: 1 },
    { name: "ctaBackground", maxCount: 1 },
  ]), 
  updateBodySettings
);

router.route("/footer").patch(upload.single("logo"), updateFooterSettings);

router.route("/theme").patch(updateThemeSettings);

// Admin routes
router.route("/all").get(getAllSettings);
router.route("/").delete(deleteSettings);

export default router;
