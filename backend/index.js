const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 5000;

// MySQL connection
const dbConfig = {
  host: process.env.DB_HOST || 'srv1816.hstgr.io',
  user: process.env.DB_USER || 'u477896473_sl',
  password: process.env.DB_PASSWORD || 'Sl@@ng@1212',
  database: process.env.DB_NAME || 'u477896473_slangprod',
};

// Multer setup for image uploads
const upload = multer({ dest: path.join(__dirname, 'uploads/') });


app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Helper: get DB connection
async function getConnection() {
  return await mysql.createConnection(dbConfig);
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const conn = await getConnection();
    const [rows] = await conn.execute('SELECT * FROM users WHERE email = ?', [email]);
    await conn.end();

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role, name: user.name }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Initialize test users (run once)
app.post('/api/auth/init-users', async (req, res) => {
  try {
    const conn = await getConnection();

    // Create test users
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedUserPassword = await bcrypt.hash('user123', 10);

    // Delete existing and insert
    await conn.execute('DELETE FROM users WHERE email = ?', ['admin@example.com']);
    await conn.execute('DELETE FROM users WHERE email = ?', ['user@example.com']);

    await conn.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Admin User', 'admin@example.com', hashedAdminPassword, 'admin']
    );

    await conn.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Regular User', 'user@example.com', hashedUserPassword, 'user']
    );

    await conn.end();
    res.json({ message: 'Test users created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/parts/upload-csv', upload.single('csv'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        const conn = await getConnection();
        for (const row of results) {
          await conn.execute(
            'INSERT INTO parts (model_number, article_number, article_name, part_name, part_pseudo_name, part_description, part_weight, part_size, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
              row.model_number,
              row.article_number,
              row.article_name,
              row.part_name,
              row.part_pseudo_name,
              row.part_description,
              row.part_weight,
              row.part_size,
              row.image || null
            ]
          );
        }
        await conn.end();
        res.json({ success: true, inserted: results.length });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
});

// CRUD: Get all parts (with optional search)
app.get('/api/parts', async (req, res) => {
  const { q } = req.query;
  let sql = 'SELECT * FROM parts';
  let params = [];
  if (q) {
    sql += ` WHERE model_number LIKE ? OR article_number LIKE ? OR article_name LIKE ? OR part_name LIKE ? OR part_pseudo_name LIKE ? OR part_description LIKE ?`;
    params = Array(6).fill(`%${q}%`);
  }
  try {
    const conn = await getConnection();
    const [rows] = await conn.execute(sql, params);
    await conn.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CRUD: Get part by ID
app.get('/api/parts/:id', async (req, res) => {
  try {
    const conn = await getConnection();
    const [rows] = await conn.execute('SELECT * FROM parts WHERE id = ?', [req.params.id]);
    await conn.end();
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CRUD: Create part
app.post('/api/parts', upload.single('image'), async (req, res) => {
  const { model_number, article_number, article_name, part_name, part_pseudo_name, part_description, part_weight, part_size } = req.body;
  const image = req.file ? req.file.filename : null;
  try {
    const conn = await getConnection();
    const [result] = await conn.execute(
      'INSERT INTO parts (model_number, article_number, article_name, part_name, part_pseudo_name, part_description, part_weight, part_size, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [model_number, article_number, article_name, part_name, part_pseudo_name, part_description, part_weight, part_size, image]
    );
    await conn.end();
    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CRUD: Update part
app.put('/api/parts/:id', upload.single('image'), async (req, res) => {
  const { model_number, article_number, article_name, part_name, part_pseudo_name, part_description, part_weight, part_size } = req.body;
  let image = req.file ? req.file.filename : null;
  try {
    const conn = await getConnection();
    // If new image, update; else keep old
    if (image) {
      await conn.execute(
        'UPDATE parts SET model_number=?, article_number=?, article_name=?, part_name=?, part_pseudo_name=?, part_description=?, part_weight=?, part_size=?, image=? WHERE id=?',
        [model_number, article_number, article_name, part_name, part_pseudo_name, part_description, part_weight, part_size, image, req.params.id]
      );
    } else {
      await conn.execute(
        'UPDATE parts SET model_number=?, article_number=?, article_name=?, part_name=?, part_pseudo_name=?, part_description=?, part_weight=?, part_size=? WHERE id=?',
        [model_number, article_number, article_name, part_name, part_pseudo_name, part_description, part_weight, part_size, req.params.id]
      );
    }
    await conn.end();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CRUD: Delete part
app.delete('/api/parts/:id', async (req, res) => {
  try {
    const conn = await getConnection();
    await conn.execute('DELETE FROM parts WHERE id = ?', [req.params.id]);
    await conn.end();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});
