const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { connectToMongo } = require("./connection");
const databaseController = require("./controllers/databaseController");
const tableController = require("./controllers/tableController");
const indexController = require("./controllers/indexController");
const {router} = require("./controllers/lab2");
const selectcontroller = require("./controllers/selectcontroller");
const app = express();
const PORT = process.env.PORT || 5000;

async function startApp() {
  app.use(cors({ origin: "http://localhost:3000" }));
  app.use(bodyParser.json());

  app.use("/database", databaseController);

  app.use("/table", tableController);

  app.use("/", router);

  app.use("/index", indexController);

  app.use("/select", selectcontroller);

  connectToMongo();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startApp();
