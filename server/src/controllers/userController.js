// Example controller to handle user routes
const { SendPrompt } = require("../../AIchat");

const getUsers = (req, res) => {
  // Simulating a database call
  const users = [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Doe" },
  ];

  res.status(200).json({ users });
};

const sendResponse = (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ message: "Prompt is missing or empty" });
  }

  res.status(201).json({ response: SendPrompt(prompt) });
};

module.exports = { getUsers, sendResponse };
