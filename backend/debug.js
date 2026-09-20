const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.all("SELECT * FROM messages WHERE id = 6", (err, rows) => {
  if (err) console.error(err);
  console.log("Message 6:", rows);
});

db.all("SELECT * FROM users", (err, rows) => {
  console.log("Users:", rows);
});
