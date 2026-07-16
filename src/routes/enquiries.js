const express = require("express");
const pool = require("../config/database");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Public: submit enquiry
router.post("/", async (req, res) => {
  try {
    const { name, phone, pack, location, message } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: "Name and phone are required" });
    }

    const result = await pool.query(
      "INSERT INTO enquiries (name, phone, pack, location, message) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, phone, pack || "not-sure", location || "", message || ""]
    );

    res.status(201).json({ success: true, enquiry: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected: list all enquiries
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = "SELECT * FROM enquiries";
    let countQuery = "SELECT COUNT(*) FROM enquiries";
    const params = [];

    if (status) {
      query += " WHERE status = $1";
      countQuery += " WHERE status = $1";
      params.push(status);
    }

    query += " ORDER BY created_at DESC LIMIT $" + (params.length + 1) + " OFFSET $" + (params.length + 2);
    params.push(limit, offset);

    const [rows, count] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, status ? [status] : []),
    ]);

    res.json({
      enquiries: rows.rows,
      total: parseInt(count.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(parseInt(count.rows[0].count) / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected: update enquiry status
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["new", "contacted", "converted"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const result = await pool.query(
      "UPDATE enquiries SET status = $1 WHERE id = $2 RETURNING *",
      [status, req.params.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Enquiry not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected: delete enquiry
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await pool.query("DELETE FROM enquiries WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
