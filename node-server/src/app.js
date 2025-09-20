const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const app = express();

// ✅ Setup CORS middleware
app.use(
  cors({
    origin: "https://iccd-halal-chatbot-local.vercel.app", // your frontend Vercel domain
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.options("*", cors());
app.use(morgan("dev"));

// Middleware
// const authMiddleware = require("./src/middlewares/authMiddleware");
// Routes
const userRoutes = require("./routes/userRoutes.js");
const modelRoutes = require("./routes/modelroutes.js");

// Set up middleware for parsing JSON and URL-encoded data
app.use(express.json()); // This allows us to handle JSON requests
app.use(express.urlencoded({ extended: true }));

// Use custom middleware (e.g., authentication check for all user routes)
// app.use("/api/users", authMiddleware);

// If user accesses /api/users, authMiddleware runs first

// Use the user routes
app.use("/api/users", userRoutes);
app.use("/api/models", modelRoutes);

// Start the server
module.exports = app;
