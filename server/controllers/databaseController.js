const express = require('express');
const router = express.Router();
const fs = require('fs');
const databaseDir = './database/';

 router.post( '/create', (req, res) => {
    const { dbName } = req.body;
    const dbPath = `${databaseDir}${dbName}.json`;
    fs.writeFileSync(dbPath, JSON.stringify({ tables: [] }));
    res.json({ message: 'Database created successfully' });
  });
  router.post( '/drop', (req, res) => {
    const { dbName } = req.body;
    const dbPath = `${databaseDir}${dbName}.json`;
    fs.unlinkSync(dbPath);
    res.json({ message: 'Database dropped successfully' });
  });
  router.post( '/use', (req, res) => {
    const { dbName } = req.params;
    // Here, you might set the "current" database in your application to dbName.
    res.json({ message: `Using database: ${dbName}` });
  });


  module.exports = router;