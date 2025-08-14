import express from "express";
import {
    submitContactForm,
    getAllContacts,
    getContactById,
    updateContactStatus,
    deleteContact,
    getContactStats
} from "../controllers/contact.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/submit", submitContactForm);

// Protected routes (admin only)
router.use(verifyJWT); // Apply JWT verification to all routes below

router.get("/all", getAllContacts);
router.get("/stats", getContactStats);
router.get("/:id", getContactById);
router.patch("/:id", updateContactStatus);
router.delete("/:id", deleteContact);

export default router;
