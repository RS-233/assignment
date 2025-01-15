// server.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import db from './config/db.js';
import expressSession from 'express-session';

import passport from 'passport';


const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
app.use(expressSession({secret: 'cairocoders-ednalan', resave: false, saveUninitialized: true}));
app.use(cors());
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

// API to register a user
app.post('/api/register', (req, res) => {
  const username = req.body.username;

  // Check if the user already exists
  db.query(`SELECT * FROM users WHERE username = ?`, [username], (err, results) => {
      if (err) {
          console.log(err);
          return res.status(500).send("Database query failed!");
      }

      // If the user exists, send a message
      if (results.length > 0) {
          return res.status(200).json({success: false, message: "User Already Registered"});
      }

      // If the user does not exist, proceed to register
      db.query(`INSERT INTO users (username) VALUES (?)`, [username], (err, result) => {
          if (err) {
              console.log(err);
              return res.json({success:false, message:"user already Registeren"});
          } else {
              return res.json({success:true, message:"user Registered Successfully", username});
          }
      });
  });
});

// API to log in
app.post('/api/login', (req, res) => {
  const username = req.body.username;
  db.query(`SELECT * FROM users WHERE username = '${username}'`, (err, result) => {
      if (err) {
          console.log(err);
          res.json({success:false, message:"Login Faild"});
      } else if (result.length > 0) {
          req.session.user = username;
          res.json({success:true, message:"user Login Successfully", username });
      } else {
        res.json({success:false, message:"user not Found"});
      }
  });
});

// API to fetch comments
app.get('/api/comments', (req, res) => {
  try {
      db.query('SELECT * FROM comments', function(err, result, fields){
      if(err){
        console.log(err);
      }
      else{
        res.status(200).json({success:true, result})
      }
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ success: false, message: "Error fetching comments" });
  }
});

// API to post a comment
app.post('/api/addcomments', async (req, res) => {
  const { username, comment } = req.body;
  const result = db.query('INSERT INTO comments (username, comment) VALUES (?, ?)', [username, comment]);
  
  const newComment = {
    id: result.insertId,
    username,
    comment,
    timestamp: new Date(),
  };

  io.emit('newComment', newComment); // Broadcast new comment to all clients
  res.json({success:true, message:"Comment Added Successfully"});
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected');
  
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});