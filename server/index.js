const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectToDatabase = require("./connection");
const databaseController = require("./controllers/databaseController");
const tableController = require("./controllers/tableController");
const indexController = require("./controllers/indexController");
const insertController = require("./controllers/lab2");
const selectcontroller = require("./controllers/selectcontroller");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(bodyParser.json());

app.use("/database", databaseController);

app.use("/table", tableController);

app.use("/", insertController);

app.use("/index", indexController);

app.use("/select",selectcontroller)

const dbURI =
  "mongodb+srv://Farchi:Masterzabest20@mydatabase.enc6jmy.mongodb.net/?retryWrites=true&w=majority";
connectToDatabase(dbURI); // Use the database controller to connect

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
