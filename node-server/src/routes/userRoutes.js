const express = require("express");
const router = express.Router();

// Import controller
const { getUsers, sendResponse } = require("../controllers/userController");
const { getModelInfo } = require("../controllers/modelControllers");

// Routes
router.get("/", getUsers); // GET /api/users
router.post("/", sendResponse); // POST /api/users


module.exports = router;
