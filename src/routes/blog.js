const express = require("express");
const pool = require("../config/database");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// Public: list published posts
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, title, slug, excerpt, cover_image, author, created_at FROM blog_posts WHERE published = true ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public: get single post
router.get("/:slug", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM blog_posts WHERE slug = $1 AND published = true", [req.params.slug]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Post not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected: list all posts (including drafts)
router.get("/admin/all", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM blog_posts ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected: create post
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, excerpt, content, cover_image, published, author } = req.body;
    if (!title || !content) return res.status(400).json({ error: "Title and content are required" });

    let slug = slugify(title);
    const existing = await pool.query("SELECT id FROM blog_posts WHERE slug = $1", [slug]);
    if (existing.rows.length > 0) slug += "-" + Date.now();

    const result = await pool.query(
      "INSERT INTO blog_posts (title, slug, excerpt, content, cover_image, published, author) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [title, slug, excerpt || "", content, cover_image || "", published || false, author || "NutriBrix Team"]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected: update post
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, excerpt, content, cover_image, published, author } = req.body;

    let slug;
    if (title) {
      slug = slugify(title);
      const existing = await pool.query("SELECT id FROM blog_posts WHERE slug = $1 AND id != $2", [slug, req.params.id]);
      if (existing.rows.length > 0) slug += "-" + Date.now();
    }

    const result = await pool.query(
      `UPDATE blog_posts SET 
        title = COALESCE($1, title),
        slug = COALESCE($2, slug),
        excerpt = COALESCE($3, excerpt),
        content = COALESCE($4, content),
        cover_image = COALESCE($5, cover_image),
        published = COALESCE($6, published),
        author = COALESCE($7, author),
        updated_at = NOW()
       WHERE id = $8 RETURNING *`,
      [title, slug, excerpt, content, cover_image, published, author, req.params.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Post not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected: delete post
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await pool.query("DELETE FROM blog_posts WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
