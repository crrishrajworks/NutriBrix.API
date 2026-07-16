require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const enquiryRoutes = require("./routes/enquiries");
const blogRoutes = require("./routes/blog");
const productRoutes = require("./routes/products");
const testimonialRoutes = require("./routes/testimonials");
const settingsRoutes = require("./routes/settings");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:3000", credentials: true }));
app.use(express.json());

// Health check
app.get("/", (req, res) => res.json({ status: "ok", service: "NutriBrix API" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/products", productRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/settings", settingsRoutes);

// Dashboard stats (protected)
const authMiddleware = require("./middleware/auth");
const pool = require("./config/database");

app.get("/api/admin/stats", authMiddleware, async (req, res) => {
  try {
    const [enquiries, blogPosts, testimonials, products] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM enquiries"),
      pool.query("SELECT COUNT(*) FROM blog_posts"),
      pool.query("SELECT COUNT(*) FROM testimonials WHERE active = true"),
      pool.query("SELECT COUNT(*) FROM products WHERE active = true"),
    ]);

    const recentEnquiries = await pool.query("SELECT * FROM enquiries ORDER BY created_at DESC LIMIT 5");

    res.json({
      totals: {
        enquiries: parseInt(enquiries.rows[0].count),
        blogPosts: parseInt(blogPosts.rows[0].count),
        testimonials: parseInt(testimonials.rows[0].count),
        products: parseInt(products.rows[0].count),
      },
      recentEnquiries: recentEnquiries.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`NutriBrix API running on port ${PORT}`);
});
