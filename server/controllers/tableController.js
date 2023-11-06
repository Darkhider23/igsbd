const fs = require('fs');
const databaseDir = './database/';

module.exports = {
  createTable: (req, res) => {
    const { dbName, tableName, tableStructure } = req.body;
    const dbPath = `${databaseDir}${dbName}.json`;
    const database = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    database.tables.push({ name: tableName, structure: tableStructure });
    fs.writeFileSync(dbPath, JSON.stringify(database));
    res.json({ message: 'Table created successfully' });
  },
  dropTable: (req, res) => {
    const { dbName, tableName } = req.body;
    console.log(dbName);
    const dbPath = `${databaseDir}${dbName}.json`;
    const database = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const tableIndex = database.tables.findIndex(table => table.name === tableName);
    if (tableIndex !== -1) {
      database.tables.splice(tableIndex, 1);
      fs.writeFileSync(dbPath, JSON.stringify(database));
      res.json({ message: 'Table dropped successfully' });
    } else {
      res.status(404).json({ error: 'Table not found' });
    }
  },
};
