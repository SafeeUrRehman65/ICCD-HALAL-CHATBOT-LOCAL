const express = require("express");
const router = express.Router();

// Import controller
const { getUsers, createUser } = require("../controllers/userController");

// Routes
router.get("/", getUsers); // GET /api/users
router.post("/", createUser); // POST /api/users

module.exports = router;
