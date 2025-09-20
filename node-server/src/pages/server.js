const app = require("../app.js");
const config = require("../config/index.js");

const PORT = config.port;

app.get("/", (req, res) => {
  res.status(200).send("How are you brothers");
});

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

module.exports = app;
