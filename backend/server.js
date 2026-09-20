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
  methods: ["GET", "POST", "PUT", "DELETE"]
}));
app.use(express.json({ limit: '10mb' }));

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
      avatar TEXT,
      description TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER,
      receiver_id INTEGER,
      text TEXT,
      timestamp TEXT,
      file_data TEXT,
      file_type TEXT,
      FOREIGN KEY(sender_id) REFERENCES users(id),
      FOREIGN KEY(receiver_id) REFERENCES users(id)
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS communities (
      id TEXT PRIMARY KEY,
      name TEXT,
      description TEXT,
      created_by INTEGER,
      avatar TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS community_members (
      community_id TEXT,
      user_id INTEGER,
      status TEXT,
      FOREIGN KEY(community_id) REFERENCES communities(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS statuses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      text TEXT,
      timestamp TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
    // Attempt to add new columns to messages if they don't exist
    db.run(`ALTER TABLE messages ADD COLUMN community_id TEXT`, () => {});
    db.run(`ALTER TABLE messages ADD COLUMN file_data TEXT`, () => {});
    db.run(`ALTER TABLE messages ADD COLUMN file_type TEXT`, () => {});
    db.run(`ALTER TABLE messages ADD COLUMN status TEXT DEFAULT 'sent'`, () => {});
    db.run(`ALTER TABLE users ADD COLUMN description TEXT`, () => {});
  }
});

const userSockets = new Map();
const socketUser = new Map();

// Register API
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const avatar = ''; // Leave empty so frontend uses default avatar
    const description = 'Hey there! I am using WhatsApp.';

    db.run(`INSERT INTO users (username, password, avatar, description) VALUES (?, ?, ?, ?)`, 
      [username, hashedPassword, avatar, description], 
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

        res.status(201).json({ id: this.lastID, username, avatar, description, token });
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
        res.json({ id: row.id, username: row.username, avatar: row.avatar, description: row.description || '', token });
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
  db.all(`
    SELECT u.id, u.username as name, u.avatar, u.description,
           (SELECT COUNT(*) FROM messages m WHERE m.sender_id = u.id AND m.receiver_id = ? AND (m.status != 'read' OR m.status IS NULL)) as unreadCount
    FROM users u WHERE u.id != ?
  `, [currentUserId, currentUserId], (err, rows) => {
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

  // Check if contactId is a community
  if (contactId.startsWith('comm_')) {
    db.all(`
      SELECT * FROM messages 
      WHERE community_id = ?
      ORDER BY id ASC
    `, [contactId], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      const formattedMessages = rows.map(r => ({
        id: r.id, text: r.text, time: r.timestamp, sender: r.sender_id, fileData: r.file_data, fileType: r.file_type, status: r.status || 'sent'
      }));
      res.json(formattedMessages);
    });
  } else {
    db.all(`
      SELECT * FROM messages 
      WHERE (sender_id = ? AND receiver_id = ?) 
         OR (sender_id = ? AND receiver_id = ?)
      ORDER BY id ASC
    `, [currentUserId, contactId, contactId, currentUserId], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      const formattedMessages = rows.map(r => ({
        id: r.id, text: r.text, time: r.timestamp, sender: r.sender_id, fileData: r.file_data, fileType: r.file_type, status: r.status || 'sent'
      }));
      res.json(formattedMessages);
    });
  }
});

// Delete Single Message API
app.delete('/messages/single/:messageId', authenticateToken, (req, res) => {
  const currentUserId = req.user.id;
  const messageId = parseInt(req.params.messageId, 10);

  console.log(`Attempting to delete message ${messageId} by user ${currentUserId}`);

  db.get(`SELECT * FROM messages WHERE id = ? AND sender_id = ?`, [messageId, currentUserId], (err, row) => {
    if (err) {
      console.error("Delete single message DB error:", err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      console.log(`Message ${messageId} not found or user ${currentUserId} is not the sender.`);
      return res.status(404).json({ error: 'Message not found or unauthorized' });
    }

    db.run(`DELETE FROM messages WHERE id = ?`, [messageId], function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      
      // Broadcast deletion
      if (row.community_id) {
        io.to(row.community_id).emit('message_deleted', { messageId: row.id, contactId: row.community_id });
      } else {
        io.emit('message_deleted', { messageId: row.id, contactId: currentUserId });
      }
      
      res.json({ success: true, messageId: row.id });
    });
  });
});

// Clear Messages API
app.delete('/messages/:contactId', authenticateToken, (req, res) => {
  const currentUserId = req.user.id;
  const contactId = req.params.contactId;

  console.log(`DELETE request received for contactId: ${contactId} by user: ${currentUserId}`);

  if (contactId.startsWith('comm_')) {
    db.run(`DELETE FROM messages WHERE community_id = ?`, [contactId], function(err) {
      if (err) {
        console.error("Delete error:", err);
        return res.status(500).json({ error: 'Database error' });
      }
      console.log(`Deleted ${this.changes} messages for community ${contactId}`);
      res.json({ success: true, deleted: this.changes });
    });
  } else {
    db.run(`
      DELETE FROM messages 
      WHERE (sender_id = ? AND receiver_id = ?) 
         OR (sender_id = ? AND receiver_id = ?)
    `, [currentUserId, contactId, contactId, currentUserId], function(err) {
      if (err) {
        console.error("Delete error:", err);
        return res.status(500).json({ error: 'Database error' });
      }
      console.log(`Deleted ${this.changes} messages for user ${contactId}`);
      res.json({ success: true, deleted: this.changes });
    });
  }
});

// Communities API
app.post('/communities', authenticateToken, (req, res) => {
  const { id, name, description, pendingMembers, avatar } = req.body;
  const userId = req.user.id;
  const finalAvatar = avatar || 'https://via.placeholder.com/150/00a884/FFFFFF?text=Users';

  db.run(`INSERT INTO communities (id, name, description, created_by, avatar) VALUES (?, ?, ?, ?, ?)`, 
    [id, name, description, userId, finalAvatar], 
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to create community' });

      // Add creator as accepted member
      db.run(`INSERT INTO community_members (community_id, user_id, status) VALUES (?, ?, ?)`, [id, userId, 'accepted']);

      // Add others directly as accepted
      if (Array.isArray(pendingMembers)) {
        pendingMembers.forEach(memberId => {
          db.run(`INSERT INTO community_members (community_id, user_id, status) VALUES (?, ?, ?)`, [id, memberId, 'accepted']);
          io.emit('added_to_community', { communityId: id, userId: memberId });
        });
      }

      res.status(201).json({ success: true });
    }
  );
});

app.get('/communities', authenticateToken, (req, res) => {
  const userId = req.user.id;
  // Get communities the user is a part of
  db.all(`
    SELECT c.*, cm.status as my_status, u.username as created_by_name 
    FROM communities c 
    JOIN community_members cm ON c.id = cm.community_id 
    LEFT JOIN users u ON c.created_by = u.id
    WHERE cm.user_id = ?
  `, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    
    // Fetch members for each community
    const fetchMembers = rows.map(comm => {
      return new Promise((resolve) => {
        db.all(`SELECT user_id, status FROM community_members WHERE community_id = ?`, [comm.id], (err, memberRows) => {
          if (!err) {
            comm.members = memberRows.filter(m => m.status === 'accepted').map(m => m.user_id);
            comm.pendingMembers = memberRows.filter(m => m.status === 'pending').map(m => m.user_id);
          }
          comm.isCommunity = true;
          comm.messages = [];
          resolve(comm);
        });
      });
    });

    Promise.all(fetchMembers).then(communities => {
      res.json(communities);
    });
  });
});

app.post('/communities/:id/accept', authenticateToken, (req, res) => {
  const communityId = req.params.id;
  const userId = req.user.id;
  db.run(`UPDATE community_members SET status = 'accepted' WHERE community_id = ? AND user_id = ?`, 
    [communityId, userId], 
    function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ success: true });
    }
  );
});

app.post('/communities/:id/members', authenticateToken, (req, res) => {
  const communityId = req.params.id;
  const userId = req.user.id;
  const { memberIds } = req.body;

  if (!Array.isArray(memberIds) || memberIds.length === 0) {
    return res.status(400).json({ error: 'memberIds must be a non-empty array' });
  }

  // Check if current user is the owner
  db.get(`SELECT created_by FROM communities WHERE id = ?`, [communityId], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(404).json({ error: 'Community not found' });
    
    if (row.created_by !== userId) {
      return res.status(403).json({ error: 'Only the community owner can add members' });
    }

    const placeholders = memberIds.map(() => '(?, ?, ?)').join(',');
    const values = [];
    memberIds.forEach(id => {
      values.push(communityId, id, 'accepted');
    });

    db.run(`INSERT OR IGNORE INTO community_members (community_id, user_id, status) VALUES ${placeholders}`, 
      values, 
      function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        
        // Broadcast members added
        io.to(communityId).emit('members_added', { communityId, memberIds });
        memberIds.forEach(memberId => {
          io.emit('added_to_community', { communityId, userId: memberId });
        });
        
        res.json({ success: true, added: memberIds });
      }
    );
  });
});

app.delete('/communities/:id/members/:memberId', authenticateToken, (req, res) => {
  const communityId = req.params.id;
  const memberId = parseInt(req.params.memberId, 10);
  const userId = req.user.id;

  // Check if current user is the owner
  db.get(`SELECT created_by FROM communities WHERE id = ?`, [communityId], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(404).json({ error: 'Community not found' });
    
    if (row.created_by !== userId) {
      return res.status(403).json({ error: 'Only the community owner can remove members' });
    }

    if (userId === memberId) {
      return res.status(400).json({ error: 'Owner cannot remove themselves' });
    }

    db.run(`DELETE FROM community_members WHERE community_id = ? AND user_id = ?`, 
      [communityId, memberId], 
      function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        
        // Broadcast member removed
        io.to(communityId).emit('member_removed', { communityId, memberId });
        
        res.json({ success: true });
      }
    );
  });
});

// Statuses API
app.post('/statuses', authenticateToken, (req, res) => {
  const { text } = req.body;
  const userId = req.user.id;
  const timestamp = new Date().toISOString();

  db.run(`INSERT INTO statuses (user_id, text, timestamp) VALUES (?, ?, ?)`, [userId, text, timestamp], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.status(201).json({ id: this.lastID, text, timestamp });
  });
});

app.get('/statuses', authenticateToken, (req, res) => {
  db.all(`
    SELECT s.id, s.text, s.timestamp, s.user_id, u.avatar, u.username as name
    FROM statuses s
    JOIN users u ON s.user_id = u.id
    ORDER BY s.id DESC
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Update Avatar API
app.put('/profile/avatar', authenticateToken, (req, res) => {
  const { avatar } = req.body;
  const userId = req.user.id;

  if (!avatar) {
    return res.status(400).json({ error: 'Avatar image is required' });
  }

  db.run(`UPDATE users SET avatar = ? WHERE id = ?`, [avatar, userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Avatar updated successfully', avatar });
  });
});

// Update Profile API
app.put('/profile', authenticateToken, async (req, res) => {
  const { username, password, avatar, description } = req.body;
  const userId = req.user.id;

  try {
    let updateQuery = 'UPDATE users SET username = ?, avatar = ?, description = ?';
    let params = [username, avatar, description];

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ', password = ?';
      params.push(hashedPassword);
    }
    
    updateQuery += ' WHERE id = ?';
    params.push(userId);

    db.run(updateQuery, params, function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Username already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Profile updated successfully', username, avatar, description });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('user_connected', (userId) => {
    if (!userId) return;
    socketUser.set(socket.id, userId);
    
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
      // First time this user connected
      socket.broadcast.emit('user_online', { userId });
    }
    userSockets.get(userId).add(socket.id);
    
    // Send current online users to this socket
    const onlineUsers = Array.from(userSockets.keys());
    socket.emit('online_users', onlineUsers);
  });

  socket.on('join_community', (communityId) => {
    socket.join(communityId);
    console.log(`Socket ${socket.id} joined room ${communityId}`);
  });

  socket.on('send_message', (data) => {
    const { contactId, message, senderId } = data;
    
    if (!senderId || !contactId || !message) return;
    
    const fileData = message.fileData || null;
    const fileType = message.fileType || null;

    if (String(contactId).startsWith('comm_')) {
      db.run(
        `INSERT INTO messages (sender_id, community_id, text, timestamp, file_data, file_type) VALUES (?, ?, ?, ?, ?, ?)`,
        [senderId, contactId, message.text, message.time, fileData, fileType],
        function(err) {
          if (err) {
            console.error("Error saving community message", err);
            return;
          }
          // Broadcast to everyone in the room except sender
          socket.to(contactId).emit('receive_message', { 
            contactId: contactId, 
            message: { id: this.lastID, text: message.text, time: message.time, sender: senderId, fileData, fileType, status: 'sent' }
          });
          socket.emit('message_sent', { tempId: message.id, realId: this.lastID, contactId: contactId });
        }
      );
    } else {
      db.run(
        `INSERT INTO messages (sender_id, receiver_id, text, timestamp, file_data, file_type) VALUES (?, ?, ?, ?, ?, ?)`,
        [senderId, contactId, message.text, message.time, fileData, fileType],
        function(err) {
          if (err) {
            console.error("Error saving message", err);
            return;
          }
          
          socket.broadcast.emit('receive_message', { 
            contactId: senderId, 
            message: { id: this.lastID, text: message.text, time: message.time, sender: senderId, fileData, fileType, status: 'sent' }
          });
          socket.emit('message_sent', { tempId: message.id, realId: this.lastID, contactId: contactId });
        }
      );
    }
  });

  socket.on('mark_messages_read', (data) => {
    const { contactId, userId } = data;
    // Update DB
    db.run(
      `UPDATE messages SET status = 'read' WHERE sender_id = ? AND receiver_id = ? AND (status != 'read' OR status IS NULL)`,
      [contactId, userId],
      function(err) {
        if (!err && this.changes > 0) {
          // Emit event to the sender that their messages were read
          if (userSockets.has(contactId)) {
            for (let targetSocketId of userSockets.get(contactId)) {
              io.to(targetSocketId).emit('messages_read', { contactId: userId });
            }
          }
        }
      }
    );
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    const userId = socketUser.get(socket.id);
    if (userId) {
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(userId);
          socket.broadcast.emit('user_offline', { userId });
        }
      }
      socketUser.delete(socket.id);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
