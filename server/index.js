const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const databaseController = require("./controllers/databaseController");
const tableController = require("./controllers/tableController");
const cors = require("cors");
const indexController = require("./controllers/indexController");
const {
  insertRecord,
  deleteRecord,
  getMetadata,
} = require("./controllers/insertController");
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(bodyParser.json());

// Database routes
app.post("/database/create", databaseController.createDatabase);
app.post("/database/drop", databaseController.dropDatabase);

// Table routes
app.post("/table/create", tableController.createTable);
app.post("/table/drop", tableController.dropTable);

//Insert Delete routes

app.post("/api/insert/:databaseName/:tableName", insertRecord);
app.post("/api/delete/:databaseName/:tableName/:primaryKey", deleteRecord);
app.get("/api/metadata/:databaseName", getMetadata);

app.post("/index/create", indexController.createIndex);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
