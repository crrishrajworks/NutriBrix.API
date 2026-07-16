const express = require("express");
const pool = require("../config/database");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Public: list active products
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products WHERE active = true ORDER BY display_order ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected: update product
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { weight, price, per_kg, label, description, image, featured, display_order, active } = req.body;

    const result = await pool.query(
      `UPDATE products SET 
        weight = COALESCE($1, weight),
        price = COALESCE($2, price),
        per_kg = COALESCE($3, per_kg),
        label = COALESCE($4, label),
        description = COALESCE($5, description),
        image = COALESCE($6, image),
        featured = COALESCE($7, featured),
        display_order = COALESCE($8, display_order),
        active = COALESCE($9, active)
       WHERE id = $10 RETURNING *`,
      [weight, price, per_kg, label, description, image, featured, display_order, active, req.params.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Product not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
