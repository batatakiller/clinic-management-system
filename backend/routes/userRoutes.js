const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  getAllDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getAllStaff,
  createStaff,
  getUserById,
  updateStaff,
  deleteStaff,
  getDashboardStats,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { verifyToken } = require("../middlewares/auth");
const { checkRole } = require("../middlewares/checkRole");
const validate = require("../middlewares/validate");

// All user management routes require authentication
router.use(verifyToken);

// Dashboard stats (needs to come BEFORE /:id to avoid wildcard matching)
router.get("/stats", checkRole("admin"), getDashboardStats);

// --- Shared Routes ---

// Doctor list: Accessible by all authenticated users (needed for patients to book)
router.get("/doctors", getAllDoctors);

// Get single user by ID: Accessible by Admin, Doctor, Receptionist
router.get("/:id", checkRole("admin", "doctor", "receptionist"), getUserById);

// --- Admin Only Routes ---
router.use(checkRole("admin"));

// Generic user update/delete (for non-doctor/staff users)
router.put(
  "/:id",
  [
    body("name", "Name cannot be empty").optional().notEmpty().trim(),
    body("email", "Please include a valid email").optional().isEmail().normalizeEmail(),
    body("phone", "Phone cannot be empty").optional().notEmpty().trim(),
  ],
  validate,
  updateUser,
);

router.delete("/:id", deleteUser);

// Doctor management
router.post(
  "/doctors",
  [
    body("name", "Name is required").notEmpty().trim(),
    body("email", "Please include a valid email").isEmail().normalizeEmail(),
    body("password", "Password must be at least 6 characters long").isLength({
      min: 6,
    }),
    body("phone", "Phone is required").notEmpty().trim(),
    body("specialization", "Specialization is required").notEmpty().trim(),
    body("licenseNumber", "License number is required").notEmpty().trim(),
  ],
  validate,
  createDoctor,
);

router.put(
  "/doctors/:id",
  [
    body("name", "Name cannot be empty").optional().notEmpty().trim(),
    body("specialization", "Specialization cannot be empty")
      .optional()
      .notEmpty()
      .trim(),
  ],
  validate,
  updateDoctor,
);

router.delete("/doctors/:id", deleteDoctor);

// Staff (receptionist) management
router.get("/staff", getAllStaff);

router.post(
  "/staff",
  [
    body("name", "Name is required").notEmpty().trim(),
    body("email", "Please include a valid email").isEmail().normalizeEmail(),
    body("password", "Password must be at least 6 characters long").isLength({
      min: 6,
    }),
    body("phone", "Phone is required").notEmpty().trim(),
  ],
  validate,
  createStaff,
);

router.put(
  "/staff/:id",
  [body("name", "Name cannot be empty").optional().notEmpty().trim()],
  validate,
  updateStaff,
);

router.delete("/staff/:id", deleteStaff);

module.exports = router;
