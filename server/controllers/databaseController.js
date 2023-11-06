const fs = require('fs');
const databaseDir = './database/';

module.exports = {
  createDatabase: (req, res) => {
    const { dbName } = req.body;
    const dbPath = `${databaseDir}${dbName}.json`;
    fs.writeFileSync(dbPath, JSON.stringify({ tables: [] }));
    res.json({ message: 'Database created successfully' });
  },
  dropDatabase: (req, res) => {
    const { dbName } = req.body;
    const dbPath = `${databaseDir}${dbName}.json`;
    fs.unlinkSync(dbPath);
    res.json({ message: 'Database dropped successfully' });
  },
  useDatabase: (req, res) => {
    const { dbName } = req.params;
    // Here, you might set the "current" database in your application to dbName.
    res.json({ message: `Using database: ${dbName}` });
  },
};
