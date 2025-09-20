const express = require("express");
const router = express.Router();

const { ModelInfo } = require("../controllers/modelControllers.js");

router.get("/", ModelInfo);

module.exports = router;
