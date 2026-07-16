const express = require("express");
const pool = require("../config/database");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Public: list active testimonials
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM testimonials WHERE active = true ORDER BY display_order ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected: create testimonial
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, role, initials, quote, display_order } = req.body;
    if (!name || !quote) return res.status(400).json({ error: "Name and quote are required" });

    const result = await pool.query(
      "INSERT INTO testimonials (name, role, initials, quote, display_order) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, role || "", initials || name.split(" ").map(n => n[0]).join(""), quote, display_order || 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected: update testimonial
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { name, role, initials, quote, display_order, active } = req.body;

    const result = await pool.query(
      `UPDATE testimonials SET 
        name = COALESCE($1, name),
        role = COALESCE($2, role),
        initials = COALESCE($3, initials),
        quote = COALESCE($4, quote),
        display_order = COALESCE($5, display_order),
        active = COALESCE($6, active)
       WHERE id = $7 RETURNING *`,
      [name, role, initials, quote, display_order, active, req.params.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Testimonial not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected: delete testimonial
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await pool.query("DELETE FROM testimonials WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
