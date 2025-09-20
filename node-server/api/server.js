const app = require("../src/app.js");
const config = require("../src/config/index.js");

const PORT = config.port;

app.get("/", (req, res) => {
  res.status(200).send("How are you brothers");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// module.exports = app;
