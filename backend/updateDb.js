const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database.sqlite');
db.run('UPDATE users SET avatar = "" WHERE avatar LIKE "%pravatar%"', (err) => {
  if (err) console.error(err);
  else console.log('Updated users');
});
