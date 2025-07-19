// Example controller to handle user routes
const getUsers = (req, res) => {
  // Simulating a database call
  const users = [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Doe" },
  ];

  res.status(200).json({ users });
};

const createUser = (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  // Simulate creating a user in the database
  const newUser = { id: Date.now(), name };
  res.status(201).json({ message: "User created", user: newUser });
};

module.exports = { getUsers, createUser };
