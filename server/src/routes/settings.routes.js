import { Router } from "express";
import {
    getSettings,
    getPublicSettings,
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

// Public route (no authentication required)
router.route("/public").get(getPublicSettings);

// All other routes require authentication
router.use(verifyJWT);

// Get global settings
router.route("/").get(getSettings);

// Update specific sections with file upload support
router.route("/header").patch(upload.single("logo"), updateHeaderSettings);

router.route("/body").patch(
    upload.any(), // Accept any files for more flexibility with service images
    updateBodySettings
);

router.route("/footer").patch(upload.single("logo"), updateFooterSettings);

router.route("/theme").patch(updateThemeSettings);

// Admin routes
router.route("/all").get(getAllSettings);
router.route("/").delete(deleteSettings);

export default router;
