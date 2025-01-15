// server/config/db.js
import mysql from 'mysql';

const db = mysql.createConnection({
    host: 'sql12.freesqldatabase.com',
    user: 'sql12757410',
    password: 'va9HSliG98',
    database: 'sql12757410',
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

export default db;
