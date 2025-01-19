const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const sequelize = require("./models/index");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN, // Your frontend's URL
    credentials: true,
  })
);

const JWT_SECRET = process.env.SESSION_SECRET;
const TOKEN_EXPIRATION = "1h"; // Adjust token validity as needed

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
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user in the database
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      {
        expiresIn: TOKEN_EXPIRATION,
      }
    );

    res.status(200).json({ message: "Login successful!", token });
  } catch (error) {
    res.status(500).json({ error: "An error occurred during login." });
  }
});

// Middleware to verify JWT
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1]; // Extract the token

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired token." });
      }
      req.user = user; // Attach user information to the request object
      next();
    });
  } else {
    res.status(401).json({ message: "Authorization token is required." });
  }
};

// Protected route (user info)
app.get("/api/user", authenticateJWT, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "username"], // Avoid returning sensitive information
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ user });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching user data." });
  }
});

// Logout (Token-based systems don't have server-side logout)
app.post("/api/logout", (req, res) => {
  // Inform the client to remove the token
  res.status(200).json({
    message:
      "Logged out successfully! Please clear your token on the client side.",
  });
});

// Start the server and sync the database
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
