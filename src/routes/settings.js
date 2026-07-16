const express = require("express");
const pool = require("../config/database");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Public: get all settings
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM site_settings");
    const settings = {};
    result.rows.forEach((row) => { settings[row.key] = row.value; });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected: update settings
router.put("/", authMiddleware, async (req, res) => {
  try {
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
      await pool.query(
        "INSERT INTO site_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()",
        [key, value]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
