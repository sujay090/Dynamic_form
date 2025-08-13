import { Router } from "express";
import {
    generateStudentIdCard,
    generateCourseCertificate,
    getCertificateEligibleStudents
} from "../controllers/certificate.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Protected routes - require authentication
router.use(verifyJWT);

// Get students eligible for certificates/ID cards
router.get("/students", getCertificateEligibleStudents);

// Generate student ID card
router.get("/id-card/:studentId", generateStudentIdCard);

// Generate course completion certificate
router.get("/certificate/:studentId", generateCourseCertificate);

export default router;
