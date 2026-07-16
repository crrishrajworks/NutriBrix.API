require("dotenv").config();
const pool = require("./config/database");
const fs = require("fs");
const path = require("path");

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, "migrations", "001_init.sql"), "utf8");
  try {
    await pool.query(sql);
    console.log("Migration complete.");
  } catch (err) {
    console.error("Migration error:", err.message);
  } finally {
    await pool.end();
  }
}

migrate();
