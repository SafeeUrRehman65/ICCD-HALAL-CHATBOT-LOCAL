const { Sequelize } = require("sequelize");
require("dotenv").config();

// Option 3: Passing parameters separately (other dialects)
// const sequelize = new Sequelize(process.env.DB_URL);

const sequelize = new Sequelize("postgres", "postgres", "safee", {
  host: "localhost",
  dialect: "postgres",
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

// connectDB();

module.exports = { sequelize, connectDB };
