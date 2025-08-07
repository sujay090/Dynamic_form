import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/protect.middleware.js";

import {
  getAllBranches,
  getAllbranchesName,
  registerBranch,
  getBranchById,
  updateBranch,
  deleteBranch,
} from "../controllers/branch.controller.js";

const router = Router();

router.route("/").post(
  verifyJWT,
  verifyAdmin,
  upload.fields([
    { name: "signature", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  registerBranch
);

router.route("/").get(verifyJWT, verifyAdmin, getAllBranches);
router.route("/all").get(verifyJWT, verifyAdmin, getAllbranchesName);

// Get branch by ID
router.route("/:id").get(verifyJWT, verifyAdmin, getBranchById);

// Update branch by ID
router.route("/:id").put(
  verifyJWT,
  verifyAdmin,
  upload.fields([
    { name: "signature", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  updateBranch
);

// Delete branch by ID
router.route("/:id").delete(verifyJWT, verifyAdmin, deleteBranch);

export default router;
