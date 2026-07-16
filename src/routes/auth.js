const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Check if any admin exists (for self-registration)
router.get("/check", async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) FROM admin_users");
    res.json({ hasAdmin: parseInt(result.rows[0].count) > 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register first admin (only if no admin exists)
router.post("/register", async (req, res) => {
  try {
    const check = await pool.query("SELECT COUNT(*) FROM admin_users");
    if (parseInt(check.rows[0].count) > 0) {
      return res.status(403).json({ error: "Admin account already exists. Please login." });
    }

    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      "INSERT INTO admin_users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name",
      [email, hash, name || "Admin"]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await pool.query("SELECT * FROM admin_users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user (protected)
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query("SELECT id, email, name FROM admin_users WHERE id = $1", [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
