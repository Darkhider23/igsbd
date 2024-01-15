// databaseController.js

const mongoose = require("mongoose");

const connectToDatabase = async (dbURI) => {
  try {
    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    // Handle the error as needed
  }
};

module.exports = connectToDatabase;
