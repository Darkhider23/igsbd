// server/controllers/indexController.js

const { table } = require('console');
const fs = require('fs');
const path = require('path');

const databaseDir = './database/';

module.exports = {
  createIndex: (req, res) => {
    const { dbName, tableName, indexName, columns } = req.body;
    console.log(dbName,tableName,indexName,columns);
    const dbPath = path.join(databaseDir, `${dbName}.json`);
    
    try {
      // Read the database JSON file
      const database = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      
      // Find the table in the database
      const table = database.tables.find((table) => table.name === tableName);

      if (table) {
        // Check if the table has an "indexes" property; if not, initialize it
        if (!table.indexes) {
          table.indexes = [];
        }

        // Create the index object and add it to the table's indexes
        table.indexes.push({ name: indexName, columns });

        // Write the updated database back to the JSON file
        fs.writeFileSync(dbPath, JSON.stringify(database));

        res.json({ message: 'Index created successfully' });
      } else {
        res.status(404).json({ error: 'Table not found' });
      }
    } catch (error) {
      console.error('An error occurred while creating the index:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
