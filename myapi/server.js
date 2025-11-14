const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const app = express();

app.use(cors({
  origin: 'http://localhost:8100', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

const port = 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const STATIC_TOKEN = process.env.STATIC_TOKEN || '200920';

const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!bearerHeader) {
    return res.status(401).json({ message: 'Token tidak ditemukan' });
  }
  const parts = bearerHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Format token salah' });
  }
  const token = parts[1];

  if (token === STATIC_TOKEN) {
    req.user = { username: 'static' };
    return next();
  }

  return res.status(401).json({ message: 'Token tidak valid' });
};

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',   
    password: '',
    database : 'dbapi'
});

db.connect((err) => {
  if (err) {
    console.error('Koneksi database gagal: ' + err.stack);
    return;
  }
  console.log('Koneksi database berhasil dengan ID: ' + db.threadId);
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});     



app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username dan password diperlukan.' });
  }

  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [username], (err, results) => {
    if (err) {
      console.error('Error saat query:', err);
      return res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Username atau password salah.' });
    }

    const user = results[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Error saat membandingkan password:', err);
        return res.status(500).json({ message: 'Terjadi kesalahan server.' });
      }

      if (isMatch) {
          return res.status(200).json({
          message: 'Login berhasil!',
          user: { id: user.id, username: user.username }
        });
      } else {
        return res.status(401).json({ message: 'Username atau password salah.' });
      }
    });
  });
});

// Endpoint Register
app.post('/register', (req, res) => {
  const { username, password } = req.body;
    if ( !username || !password ) {
        return res.status(400).json({ message : 'username dan password harus di isi.'});
    }
  const chechUserQuery = 'SELECT * FROM users WHERE username = ?';
  db.query(chechUserQuery, [username], (err, results) => {
        if (err) {
            console.error('Error saat query:', err);
            return res.status(500).json({ message: 'Terjadi kesalahan server.' });
        }
        if (results.length > 0) {
            return res.status(409).json({ message: 'Username sudah terdaftar.' });
        }
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) {
                console.error('Error saat hashing password:', err);
                return res.status(500).json({ message: 'Terjadi kesalahan server.' });
            }
            const insertUserQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
            db.query(insertUserQuery, [username, hash], (err, results) => {
                if (err) {
                    console.error('Error saat menyimpan user:', err);
                    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
                }
                return res.status(201).json({ message: 'Registrasi berhasil!', user: { id: results.insertId, username } });
            });
        });
    });
});

// endpoint melihat data

app.get('/data', verifyToken, (req, res) => {
  const sql = 'SELECT * FROM field_data';
  db.query(sql,(err, results) => {
    if(err){
      console.error('Error saat query:', err);
      return res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
    res.status(200).json({
      message: 'Data berhasil diambil',
      total: results.length,
      data: results

    })
  })
})

//endpoint menambah data

app.post('/data/post', verifyToken, (req, res) =>{
  const { id, userid, title, body } = req.body;

  if ( !id || !userid || !title || !body ) {
    return res.status(400).json({ message : 'Semua field harus di isi.'});
  }

  const sql = 'INSERT INTO field_data (id, userid, title, body) VALUES (?, ?, ?, ?)';
  db.query(sql, [id, userid, title, body], (err, res) => {
    if (err) {
      console.error('Error saat menambah data:', err);
      return res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }

    return res.status(201).json({ message: 'Data berhasil ditambahkan.', data: { id, userid, title, body } });
  });
});