import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(
    cors({
        origin: [
            "https://computer.iconcomputer.in",
            "http://localhost:5173",
            "http://localhost:5174",
            "https://admin.nsvi.in",
        ],
        // origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Import routes
import userRoutes from "./routes/user.routes.js";
import studentRoutes from "./routes/dynamicData.routes.js";
import courseRoutes from "./routes/course.routes.js";
import courseCategoryRoutes from "./routes/courseCategory.routes.js";
import coursePaperRoutes from "./routes/coursePaper.routes.js";
import branchRoutes from "./routes/branch.routes.js";
import resultRoutes from "./routes/result.routes.js";
import branchMenuRoutes from "./routes/branchMenu.routes.js";
import adminMenuRoutes from "./routes/adminMenu.routes.js";
import sidebarMenuRoutes from "./routes/sidebarMenu.routes.js";
import dynamicFormRoutes from "./routes/dynamicForm.routes.js";
import superAdminLoginRoutes from "./routes/superAdmin.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import certificateRoutes from "./routes/certificate.routes.js";
import publicRoutes from "./routes/public.routes.js";
import chatbotRoutes from "./routes/chatbot.routes.js";
import contactRoutes from "./routes/contact.routes.js";

// Use routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/students", studentRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/course/categories", courseCategoryRoutes);
app.use("/api/v1/course/papers", coursePaperRoutes);
app.use("/api/v1/branches", branchRoutes);
app.use("/api/v1/results", resultRoutes);
app.use("/api/v1/branch-menus", branchMenuRoutes);
app.use("/api/v1/admin-menus", adminMenuRoutes);
app.use("/api/v1/sidebar-menus", sidebarMenuRoutes);
app.use("/api/v1/dynamic-forms", dynamicFormRoutes);
app.use("/api/v1/super-admin", superAdminLoginRoutes);
app.use("/api/v1/settings", settingsRoutes);
app.use("/api/v1/certificates", certificateRoutes);
app.use("/api/v1/public", publicRoutes);
app.use("/api/v1/chatbot", chatbotRoutes);
app.use("/api/v1/contact", contactRoutes);
export { app };
