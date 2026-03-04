const express = require("express");
const {
  sendMessage,
  healthCheck,
} = require("../controllers/chatbotController");
const { verifyToken } = require("../middlewares/auth");

const router = express.Router();

// ── Public Routes ──────────────────────────────────────────────────────
router.get("/health", healthCheck);

// ── Protected Routes (require authentication) ──────────────────────────
router.post("/message", verifyToken, sendMessage);

module.exports = router;
