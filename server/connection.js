const { MongoClient } = require("mongodb");

// Replace "your-mongodb-uri" with your MongoDB connection string
const uri =
  "mongodb+srv://Farchi:Masterzabest20@mydatabase.enc6jmy.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function connectToMongo() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
  }
}

const getDbClient = () => {
  if (!client) {
    throw new Error("Database client is not connected.");
  }
  return client;
};

module.exports = { connectToMongo, getDbClient };
