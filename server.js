require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Create a MySQL connection pool for better performance
const db = mysql.createPool({
  uri: process.env.MYSQL_URL,
  waitForConnections: true,
  connectionLimit: 10, // Adjust as needed
  queueLimit: 0,
});

// Check database connection on startup
db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("✅ Connected to Railway MySQL database!");
    connection.release(); // Release connection back to pool
  }
});

// Test API Route
app.get("/", (req, res) => {
  res.json({ message: "🚀 Server is running and connected to Railway MySQL!" });
});

// ✅ Route to fetch all users
app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// ✅ Route to add a new user
app.post("/users", (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  db.query("INSERT INTO users (name, email) VALUES (?, ?)", [name, email], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "✅ User added successfully", userId: result.insertId });
  });
});

// ✅ Route to delete a user by ID
app.delete("/users/:id", (req, res) => {
  const userId = req.params.id;
  db.query("DELETE FROM users WHERE id = ?", [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    } else if (result.affectedRows === 0) {
      return res.status(404).json({ message: "❌ User not found" });
    }
    res.json({ message: "✅ User deleted successfully" });
  });
});

// ✅ Route to update a user's details
app.put("/users/:id", (req, res) => {
  const userId = req.params.id;
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  const sql = "UPDATE users SET name = ?, email = ? WHERE id = ?";
  db.query(sql, [name, email, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    } else if (result.affectedRows === 0) {
      return res.status(404).json({ message: "❌ User not found" });
    }
    res.json({ message: "✅ User updated successfully!" });
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
