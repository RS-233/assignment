// server/routes/comments.js
import express from 'express';
import db from '../config/db.js';

const router = express.Router();


// POST /api/register
router.post('/register', (req, res) => {
  app.get("/",(req,res)=>{
    res.send("API Working")
  })
  const { username, password } = req.body;
  const sql = 'INSERT INTO users (username) VALUES (?)';
  
  db.query(sql, [username],[password], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Username already exists' });
      }
      return res.status(500).json(err);
    }
    res.status(201).json({ id: result.insertId, username });
  });
});

router.post('/login', (req, res) => {
  const { username } = req.body;
  const sessionId = Math.random().toString(36).substring(2, 15); // Generate a simple session ID
  res.json({ sessionId, username });
});

// GET /api/comments
router.get('/api/comments', (req, res) => {
  const sql = 'SELECT * FROM comments ORDER BY timestamp DESC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// POST /api/comments
router.post('/', (req, res) => {
  const { username, comment } = req.body;
  const sql = 'INSERT INTO comments (username, comment) VALUES (?, ?)';
  db.query(sql, [username, comment], (err, result) => {
    if (err) return res.status(500).json(err);
    const newComment = { id: result.insertId, username, comment, timestamp: new Date() };
    io.emit('newComment', newComment); // Emit the new comment to all connected clients
    res.status(201).json(newComment);
  });
});

export default (io) => router;



