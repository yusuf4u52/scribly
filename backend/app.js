const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");
const session = require("express-session");
const User = require("./models/User");
const sequelize = require("./models/index");
require("./passportConfig");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT;

// Middleware
const isProduction = process.env.NODE_ENV === "production";
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Replace with a strong secret
    resave: false, // Prevents session from being saved back to the session store if it hasn't been modified
    saveUninitialized: false, // Prevents uninitialized sessions from being saved
    cookie: {
      httpOnly: true, // Prevents client-side JavaScript from accessing cookies
      secure: process.env.NODE_ENV === "production", // Use HTTPS in production
      maxAge: 1000 * 60 * 60, // 1 hour (set based on your needs)
      sameSite: "lax", // Required for cross-origin requests
    },
  })
);

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN,
    credentials: true,
  })
);

// Register endpoint
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user in the database
    const user = await User.create({ username, password: hashedPassword });
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(400).json({ error: "User already exists or invalid data." });
  }
});

// Login endpoint
app.post("/api/login", passport.authenticate("local"), (req, res) => {
  res.status(200).json({ message: "Login successful!" });
});

// Protected route (user info)
app.get("/api/user", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({ user: req.user });
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});

// Logout endpoint
app.post("/api/logout", (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.status(200).json({ message: "Logged out successfully!" });
  });
});

// Start the server and sync the database
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
