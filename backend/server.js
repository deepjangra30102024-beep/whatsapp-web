require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST"]
}));
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Setup SQLite database
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      avatar TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER,
      receiver_id INTEGER,
      text TEXT,
      timestamp TEXT,
      FOREIGN KEY(sender_id) REFERENCES users(id),
      FOREIGN KEY(receiver_id) REFERENCES users(id)
    )`);
  }
});

// Register API
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const avatar = `https://i.pravatar.cc/150?u=${username}`; // Generate random avatar based on username

    db.run(`INSERT INTO users (username, password, avatar) VALUES (?, ?, ?)`, 
      [username, hashedPassword, avatar], 
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Username already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }
        
        const token = jwt.sign(
          { id: this.lastID, username }, 
          process.env.JWT_SECRET || 'secret', 
          { expiresIn: '24h' }
        );

        res.status(201).json({ id: this.lastID, username, avatar, token });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login API
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get(`SELECT * FROM users WHERE username = ?`, 
    [username], 
    async (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (row && await bcrypt.compare(password, row.password)) {
        const token = jwt.sign(
          { id: row.id, username: row.username }, 
          process.env.JWT_SECRET || 'secret', 
          { expiresIn: '24h' }
        );
        res.json({ id: row.id, username: row.username, avatar: row.avatar, token });
      } else {
        res.status(401).json({ error: 'Invalid username or password' });
      }
  });
});

// Middleware for JWT authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Get Contacts API (all users except current)
app.get('/contacts', authenticateToken, (req, res) => {
  const currentUserId = req.user.id;
  db.all(`SELECT id, username as name, avatar FROM users WHERE id != ?`, [currentUserId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    // Add an empty array for messages to match frontend expectations initially
    const contacts = rows.map(r => ({ ...r, messages: [] }));
    res.json(contacts);
  });
});

// Get Messages API
app.get('/messages/:contactId', authenticateToken, (req, res) => {
  const currentUserId = req.user.id;
  const contactId = req.params.contactId;

  db.all(`
    SELECT * FROM messages 
    WHERE (sender_id = ? AND receiver_id = ?) 
       OR (sender_id = ? AND receiver_id = ?)
    ORDER BY id ASC
  `, [currentUserId, contactId, contactId, currentUserId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Format to match frontend structure: { id, text, time, sender }
    const formattedMessages = rows.map(r => ({
      id: r.id,
      text: r.text,
      time: r.timestamp,
      sender: r.sender_id
    }));

    res.json(formattedMessages);
  });
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('send_message', (data) => {
    const { contactId, message, senderId } = data;
    
    if (!senderId || !contactId || !message) return;

    db.run(
      `INSERT INTO messages (sender_id, receiver_id, text, timestamp) VALUES (?, ?, ?, ?)`,
      [senderId, contactId, message.text, message.time],
      function(err) {
        if (err) {
          console.error("Error saving message", err);
          return;
        }
        
        socket.broadcast.emit('receive_message', { 
          contactId: senderId, 
          message: { id: this.lastID, text: message.text, time: message.time, sender: senderId }
        });
      }
    );
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
