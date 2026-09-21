const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3456;
const JWT_SECRET = process.env.JWT_SECRET || 'undangan-wedding-secret-key-2026';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://tazkiahfarhan.my.id';

// Middleware
app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));

// File upload middleware
const uploadsDir = path.join(__dirname, 'uploads', 'photos');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${req.params.id || Date.now()}.jpg`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Serve uploaded photos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database setup
const dbPath = path.join(__dirname, 'undangan.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS guests (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    qr_code TEXT UNIQUE NOT NULL,
    rsvp_status INTEGER DEFAULT 0,
    souvenir_taken INTEGER DEFAULT 0,
    message TEXT,
    attendance_count INTEGER DEFAULT 1,
    invited_pax INTEGER DEFAULT 2,
    has_arrived INTEGER DEFAULT 0,
    arrival_time TEXT,
    is_vip INTEGER DEFAULT 0,
    photo_url TEXT,
    wishes TEXT,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS wedding_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    groom_name TEXT,
    bride_name TEXT,
    wedding_date TEXT,
    location_name TEXT,
    location_address TEXT,
    maps_url TEXT
  );

  CREATE TABLE IF NOT EXISTS love_stories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_date TEXT,
    title TEXT,
    description TEXT,
    image_url TEXT,
    order_index INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS galleries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_url TEXT,
    aspect_ratio TEXT,
    order_index INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS rundowns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    time_start TEXT,
    time_end TEXT,
    title TEXT,
    description TEXT,
    order_index INTEGER DEFAULT 0
  );
`);

// Seed data from backups on first run
function seedDatabase() {
  const tables = ['guests', 'wedding_settings', 'love_stories', 'galleries', 'rundowns'];
  
  for (const table of tables) {
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
    if (count.count === 0) {
      const backupPath = path.join(__dirname, '..', 'backups', `${table}.json`);
      if (fs.existsSync(backupPath)) {
        const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
        if (data.length > 0) {
          console.log(`Seeding ${table} with ${data.length} records...`);
          
          if (table === 'guests') {
            const stmt = db.prepare(`
              INSERT OR IGNORE INTO guests (id, name, qr_code, rsvp_status, souvenir_taken, message, attendance_count, invited_pax, has_arrived, arrival_time, is_vip, photo_url, wishes, description, created_at)
              VALUES (@id, @name, @qr_code, @rsvp_status, @souvenir_taken, @message, @attendance_count, @invited_pax, @has_arrived, @arrival_time, @is_vip, @photo_url, @wishes, @description, @created_at)
            `);
            const insertMany = db.transaction((items) => {
              for (const item of items) {
                stmt.run({
                  id: item.id,
                  name: item.name,
                  qr_code: item.qr_code,
                  rsvp_status: item.rsvp_status ? 1 : 0,
                  souvenir_taken: item.souvenir_taken ? 1 : 0,
                  message: item.message || null,
                  attendance_count: item.attendance_count || 1,
                  invited_pax: item.invited_pax || 2,
                  has_arrived: item.has_arrived ? 1 : 0,
                  arrival_time: item.arrival_time || null,
                  is_vip: item.is_vip ? 1 : 0,
                  photo_url: item.photo_url || null,
                  wishes: item.wishes || null,
                  description: item.description || null,
                  created_at: item.created_at || new Date().toISOString()
                });
              }
            });
            insertMany(data);
          } else {
            const cols = Object.keys(data[0]);
            const placeholders = cols.map(c => `@${c}`).join(', ');
            const stmt = db.prepare(`INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`);
            const insertMany = db.transaction((items) => {
              for (const item of items) {
                stmt.run(item);
              }
            });
            insertMany(data);
          }
        }
      }
    }
  }
}

seedDatabase();

// Auth middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ email: email || 'admin@tazkiahfarhan.my.id', role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ 
      token,
      user: { email: email || 'admin@tazkiahfarhan.my.id', role: 'admin' }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.get('/api/auth/session', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Optional auth helper to check if requester is admin
function getAdminUser(req) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// Guest routes
// Public access: returns sanitized wishes/guestbook messages OR projector attendee photos
// Admin access: returns full guest list with qr_code, souvenir_taken, etc.
app.get('/api/guests', (req, res) => {
  try {
    const admin = getAdminUser(req);
    const { has_arrived, qr_code, message_not_null } = req.query;
    
    // If not authenticated admin:
    // Only allow message_not_null (public guestbook wishes) OR has_arrived=true (projector screen) OR specific qr_code
    if (!admin && !message_not_null && has_arrived === undefined && !qr_code) {
      return res.status(401).json({ error: 'Authentication required to view guest directory' });
    }

    let query = 'SELECT * FROM guests';
    const conditions = [];
    const params = {};
    
    if (has_arrived !== undefined) {
      conditions.push('has_arrived = @has_arrived');
      params.has_arrived = has_arrived === 'true' ? 1 : 0;
    }
    
    if (qr_code) {
      conditions.push('qr_code = @qr_code');
      params.qr_code = qr_code;
    }
    
    if (message_not_null === 'true') {
      conditions.push('message IS NOT NULL');
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    // Order guestbook newest first
    if (message_not_null === 'true') {
      query += ' ORDER BY created_at DESC';
    }

    const guests = db.prepare(query).all(params);
    
    // If request is from unauthenticated user (public): strip sensitive operational fields
    const formatted = guests.map(g => {
      if (admin) {
        return {
          ...g,
          rsvp_status: !!g.rsvp_status,
          souvenir_taken: !!g.souvenir_taken,
          has_arrived: !!g.has_arrived,
          is_vip: !!g.is_vip
        };
      }
      
      // Sanitized public projection
      return {
        id: g.id,
        name: g.name,
        rsvp_status: !!g.rsvp_status,
        attendance_count: g.attendance_count,
        message: g.message,
        photo_url: g.photo_url,
        wishes: g.wishes,
        arrival_time: g.arrival_time,
        is_vip: !!g.is_vip,
        created_at: g.created_at
      };
    });
    
    res.json(formatted);
  } catch (err) {
    console.error('Error fetching guests:', err);
    res.status(500).json({ error: err.message });
  }
});

// Single guest by QR code (for personalized invitation view)
app.get('/api/guests/:qr_code', (req, res) => {
  try {
    const guest = db.prepare('SELECT id, name, qr_code, rsvp_status, attendance_count, invited_pax, description FROM guests WHERE qr_code = ?').get(req.params.qr_code);
    if (!guest) {
      return res.status(404).json({ error: 'Guest not found' });
    }
    res.json({
      ...guest,
      rsvp_status: !!guest.rsvp_status
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create guest: Admin authenticated OR public manual RSVP with sanitized fields
app.post('/api/guests', (req, res) => {
  try {
    const admin = getAdminUser(req);
    const guests = Array.isArray(req.body) ? req.body : [req.body];
    const results = [];
    
    for (const guest of guests) {
      if (!guest.name || typeof guest.name !== 'string' || guest.name.trim().length === 0) {
        return res.status(400).json({ error: 'Nama tamu wajib diisi' });
      }

      const id = guest.id || require('crypto').randomUUID();
      const qr_code = admin ? (guest.qr_code || `GUEST-${Date.now()}`) : `manual-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const stmt = db.prepare(`
        INSERT INTO guests (id, name, qr_code, rsvp_status, souvenir_taken, message, attendance_count, invited_pax, has_arrived, arrival_time, is_vip, photo_url, wishes, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        id,
        guest.name.trim().slice(0, 100),
        qr_code,
        guest.rsvp_status ? 1 : 0,
        admin && guest.souvenir_taken ? 1 : 0,
        guest.message ? String(guest.message).trim().slice(0, 500) : null,
        Math.min(Math.max(Number(guest.attendance_count) || 1, 0), 10),
        admin ? (guest.invited_pax || 2) : 2,
        admin && guest.has_arrived ? 1 : 0,
        admin ? (guest.arrival_time || null) : null,
        admin && guest.is_vip ? 1 : 0,
        admin ? (guest.photo_url || null) : null,
        admin ? (guest.wishes || null) : null,
        admin ? (guest.description || null) : null
      );
      
      results.push({ id, name: guest.name, qr_code, rsvp_status: !!guest.rsvp_status });
    }
    
    res.json(results.length === 1 ? results[0] : results);
  } catch (err) {
    console.error('Error creating guest:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update guest: Admin can update anything; Public can only update their own RSVP (rsvp_status, attendance_count, message)
app.put('/api/guests/:id', (req, res) => {
  try {
    const admin = getAdminUser(req);
    const { id } = req.params;
    const updates = req.body;
    
    const existing = db.prepare('SELECT * FROM guests WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Guest not found' });
    }

    const setClauses = [];
    const params = {};
    
    // If not admin, whitelist strictly allowed RSVP fields
    const allowedKeys = admin 
      ? ['name', 'qr_code', 'rsvp_status', 'souvenir_taken', 'message', 'attendance_count', 'invited_pax', 'has_arrived', 'arrival_time', 'is_vip', 'photo_url', 'wishes', 'description']
      : ['rsvp_status', 'attendance_count', 'message'];

    for (const key of allowedKeys) {
      if (updates[key] !== undefined) {
        let value = updates[key];
        if (typeof value === 'boolean') {
          value = value ? 1 : 0;
        } else if (key === 'attendance_count') {
          value = Math.min(Math.max(Number(value) || 1, 0), 10);
        } else if (key === 'message' && value) {
          value = String(value).trim().slice(0, 500);
        }
        setClauses.push(`${key} = @${key}`);
        params[key] = value;
      }
    }
    
    if (setClauses.length === 0) {
      return res.json(existing);
    }

    params.id = id;
    const stmt = db.prepare(`UPDATE guests SET ${setClauses.join(', ')} WHERE id = @id`);
    stmt.run(params);
    
    const updated = db.prepare('SELECT * FROM guests WHERE id = ?').get(id);
    res.json({
      ...updated,
      rsvp_status: !!updated.rsvp_status,
      souvenir_taken: !!updated.souvenir_taken,
      has_arrived: !!updated.has_arrived,
      is_vip: !!updated.is_vip
    });
  } catch (err) {
    console.error('Error updating guest:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/guests/:id', authenticateToken, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM guests WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Guest not found' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Wedding settings routes
app.get('/api/wedding_settings', (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM wedding_settings LIMIT 1').get();
    res.json(settings || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/wedding_settings', authenticateToken, (req, res) => {
  try {
    const settings = req.body;
    const existing = db.prepare('SELECT * FROM wedding_settings LIMIT 1').get();
    
    if (existing) {
      db.prepare(`
        UPDATE wedding_settings SET groom_name = ?, bride_name = ?, wedding_date = ?, location_name = ?, location_address = ?, maps_url = ?
        WHERE id = ?
      `).run(settings.groom_name, settings.bride_name, settings.wedding_date, settings.location_name, settings.location_address, settings.maps_url, existing.id);
    } else {
      db.prepare(`
        INSERT INTO wedding_settings (groom_name, bride_name, wedding_date, location_name, location_address, maps_url)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(settings.groom_name, settings.bride_name, settings.wedding_date, settings.location_name, settings.location_address, settings.maps_url);
    }
    
    const updated = db.prepare('SELECT * FROM wedding_settings LIMIT 1').get();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Love stories routes
app.get('/api/love_stories', (req, res) => {
  try {
    const stories = db.prepare('SELECT * FROM love_stories ORDER BY order_index ASC').all();
    res.json(stories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/love_stories', authenticateToken, (req, res) => {
  try {
    const story = req.body;
    const stmt = db.prepare(`
      INSERT INTO love_stories (event_date, title, description, image_url, order_index)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(story.event_date, story.title, story.description, story.image_url, story.order_index || 0);
    res.json({ id: info.lastInsertRowid, ...story });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/love_stories/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const story = req.body;
    db.prepare(`
      UPDATE love_stories SET event_date = ?, title = ?, description = ?, image_url = ?, order_index = ?
      WHERE id = ?
    `).run(story.event_date, story.title, story.description, story.image_url, story.order_index || 0, id);
    res.json({ id: parseInt(id), ...story });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/love_stories/:id', authenticateToken, (req, res) => {
  try {
    db.prepare('DELETE FROM love_stories WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Galleries routes
app.get('/api/galleries', (req, res) => {
  try {
    const galleries = db.prepare('SELECT * FROM galleries ORDER BY order_index ASC').all();
    res.json(galleries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/galleries', authenticateToken, (req, res) => {
  try {
    const gallery = req.body;
    const stmt = db.prepare(`
      INSERT INTO galleries (image_url, aspect_ratio, order_index)
      VALUES (?, ?, ?)
    `);
    const info = stmt.run(gallery.image_url, gallery.aspect_ratio, gallery.order_index || 0);
    res.json({ id: info.lastInsertRowid, ...gallery });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/galleries/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const gallery = req.body;
    db.prepare(`
      UPDATE galleries SET image_url = ?, aspect_ratio = ?, order_index = ?
      WHERE id = ?
    `).run(gallery.image_url, gallery.aspect_ratio, gallery.order_index || 0, id);
    res.json({ id: parseInt(id), ...gallery });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/galleries/:id', authenticateToken, (req, res) => {
  try {
    db.prepare('DELETE FROM galleries WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rundowns routes
app.get('/api/rundowns', (req, res) => {
  try {
    const rundowns = db.prepare('SELECT * FROM rundowns ORDER BY order_index ASC').all();
    res.json(rundowns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/rundowns', authenticateToken, (req, res) => {
  try {
    const rundown = req.body;
    const stmt = db.prepare(`
      INSERT INTO rundowns (time_start, time_end, title, description, order_index)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(rundown.time_start, rundown.time_end, rundown.title, rundown.description, rundown.order_index || 0);
    res.json({ id: info.lastInsertRowid, ...rundown });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/rundowns/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const rundown = req.body;
    db.prepare(`
      UPDATE rundowns SET time_start = ?, time_end = ?, title = ?, description = ?, order_index = ?
      WHERE id = ?
    `).run(rundown.time_start, rundown.time_end, rundown.title, rundown.description, rundown.order_index || 0, id);
    res.json({ id: parseInt(id), ...rundown });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/rundowns/:id', authenticateToken, (req, res) => {
  try {
    db.prepare('DELETE FROM rundowns WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Photo upload endpoint
app.post('/api/photos/:id', authenticateToken, upload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const photoUrl = `/uploads/photos/${req.file.filename}`;
    
    // Update guest photo_url in database
    db.prepare('UPDATE guests SET photo_url = ? WHERE id = ?').run(photoUrl, req.params.id);
    
    res.json({ photo_url: photoUrl });
  } catch (err) {
    console.error('Error uploading photo:', err);
    res.status(500).json({ error: err.message });
  }
});

// Photo delete endpoint
app.delete('/api/photos/:id', authenticateToken, (req, res) => {
  try {
    const filePath = path.join(uploadsDir, `${req.params.id}.jpg`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    db.prepare('UPDATE guests SET photo_url = NULL WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  db.close();
  process.exit(0);
});
