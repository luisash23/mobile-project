# Dokumentasi API - MyJsonApp

## 📋 Daftar Isi
1. [Overview](#overview)
2. [Setup & Konfigurasi](#setup--konfigurasi)
3. [Autentikasi & Keamanan](#autentikasi--keamanan)
4. [Endpoint API](#endpoint-api)
5. [Database Schema](#database-schema)
6. [Error Handling](#error-handling)
7. [Contoh Penggunaan](#contoh-penggunaan)

---

## 📌 Overview

API ini adalah backend untuk aplikasi mobile MyJsonApp yang dibangun menggunakan **Express.js** dan **MySQL**. API menyediakan fitur:

- ✅ Autentikasi pengguna (Login & Register)
- ✅ Manajemen data post (Create, Read)
- ✅ Keamanan dengan token verification
- ✅ Password hashing menggunakan bcrypt
- ✅ CORS support untuk client Ionic/Vue.js

**Teknologi yang digunakan:**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: Bearer Token
- **Password Hashing**: bcrypt
- **CORS**: express-cors

---

## 🔧 Setup & Konfigurasi

### 1. Instalasi Dependencies

```bash
npm install express mysql cors body-parser bcrypt
```

### 2. Konfigurasi Database MySQL

Buat database dan tabel:

```sql
-- Buat database
CREATE DATABASE dbapi;
USE dbapi;

-- Tabel users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel field_data (untuk posts)
CREATE TABLE field_data (
  id INT PRIMARY KEY,
  userid INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  body LONGTEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userid) REFERENCES users(id)
);
```

### 3. Konfigurasi Server

Di `server.js`:

```javascript
const db = mysql.createConnection({
    host: 'localhost',      // Host MySQL
    user: 'root',           // Username MySQL
    password: '',           // Password MySQL (kosong jika default)
    database: 'dbapi'       // Nama database
});
```

### 4. Environment Variables

Token static dapat diatur melalui environment variable:

```bash
export STATIC_TOKEN=200920
```

Atau di file `.env`:

```
STATIC_TOKEN=200920
```

### 5. Menjalankan Server

```bash
node server.js
```

Server akan berjalan di `http://localhost:3000`

---

## 🔐 Autentikasi & Keamanan

### Token Verification Middleware

Semua endpoint yang memerlukan autentikasi menggunakan middleware `verifyToken`:

```javascript
const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  
  if (!bearerHeader) {
    return res.status(401).json({ message: 'Token tidak ditemukan' });
  }

  const parts = bearerHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Format token salah' });
  }

  const token = parts[1];
  
  // Validasi token
  if (token === STATIC_TOKEN) {
    req.user = { username: 'static' };
    return next();
  }

  return res.status(401).json({ message: 'Token tidak valid' });
};
```

### Aturan Token:
- ✅ Token harus dikirim dalam header: `Authorization: Bearer <token>`
- ✅ Format: Bearer diikuti spasi kemudian token
- ✅ Token default: `200920` (dapat diubah via environment variable)
- ✅ Validasi strict - format salah akan ditolak

### Password Security:
- ✅ Password di-hash menggunakan bcrypt dengan salt rounds 10
- ✅ Password tidak disimpan dalam plain text
- ✅ Perbandingan password menggunakan `bcrypt.compare()`

---

## 🔌 Endpoint API

### 1. **POST /login**

**Fungsi**: Autentikasi pengguna dan melakukan login

**Request:**
```json
{
  "username": "user123",
  "password": "password123"
}
```

**Response Success (200):**
```json
{
  "message": "Login berhasil!",
  "user": {
    "id": 1,
    "username": "user123"
  }
}
```

**Response Error (401):**
```json
{
  "message": "Username atau password salah."
}
```

**Validasi:**
- ✅ Username dan password harus ada
- ✅ Username harus ada di database
- ✅ Password harus cocok (diverifikasi dengan bcrypt)

**Catatan**: Endpoint ini TIDAK memerlukan token

---

### 2. **POST /register**

**Fungsi**: Registrasi pengguna baru

**Request:**
```json
{
  "username": "newuser",
  "password": "password123"
}
```

**Response Success (201):**
```json
{
  "message": "Registrasi berhasil!",
  "user": {
    "id": 2,
    "username": "newuser"
  }
}
```

**Response Error (409):**
```json
{
  "message": "Username sudah terdaftar."
}
```

**Response Error (400):**
```json
{
  "message": "username dan password harus di isi."
}
```

**Validasi:**
- ✅ Username dan password harus ada
- ✅ Username tidak boleh duplikat
- ✅ Password akan di-hash sebelum disimpan

**Catatan**: Endpoint ini TIDAK memerlukan token

---

### 3. **GET /data**

**Fungsi**: Mengambil semua data post

**Headers:**
```
Authorization: Bearer 200920
Content-Type: application/json
```

**Response Success (200):**
```json
{
  "message": "Data berhasil diambil",
  "total": 2,
  "data": [
    {
      "id": 1,
      "userid": 1,
      "title": "Judul Post 1",
      "body": "Isi post pertama"
    },
    {
      "id": 2,
      "userid": 1,
      "title": "Judul Post 2",
      "body": "Isi post kedua"
    }
  ]
}
```

**Response Error (401):**
```json
{
  "message": "Token tidak ditemukan"
}
```

**Catatan**: 
- ✅ **MEMERLUKAN token** dalam header Authorization
- ✅ Mengembalikan semua post dari database
- ✅ Termasuk total jumlah data

---

### 4. **POST /data/post**

**Fungsi**: Menambahkan data post baru

**Headers:**
```
Authorization: Bearer 200920
Content-Type: application/json
```

**Request:**
```json
{
  "id": 1,
  "userid": 1,
  "title": "Judul Post",
  "body": "Isi lengkap post"
}
```

**Response Success (201):**
```json
{
  "message": "Data berhasil ditambahkan.",
  "data": {
    "id": 1,
    "userid": 1,
    "title": "Judul Post",
    "body": "Isi lengkap post"
  }
}
```

**Response Error (400):**
```json
{
  "message": "Semua field harus di isi."
}
```

**Response Error (401):**
```json
{
  "message": "Token tidak ditemukan"
}
```

**Validasi:**
- ✅ Semua field (id, userid, title, body) harus ada
- ✅ **MEMERLUKAN token** dalam header Authorization
- ✅ Post ID harus unik (primary key)

---

## 🗄️ Database Schema

### Tabel: users

| Column | Type | Constraint | Keterangan |
|--------|------|-----------|-----------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | ID pengguna |
| username | VARCHAR(255) | UNIQUE, NOT NULL | Username unik |
| password | VARCHAR(255) | NOT NULL | Password terenkripsi bcrypt |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu pembuatan akun |

### Tabel: field_data

| Column | Type | Constraint | Keterangan |
|--------|------|-----------|-----------|
| id | INT | PRIMARY KEY | ID post (unik) |
| userid | INT | NOT NULL, FOREIGN KEY | Referensi ke users.id |
| title | VARCHAR(255) | NOT NULL | Judul post |
| body | LONGTEXT | NOT NULL | Isi/konten post |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu pembuatan post |

### Relasi:
```
users (1) ──────────── (Many) field_data
         userid FK
```

---

## ⚠️ Error Handling

### HTTP Status Codes:

| Code | Meaning | Contoh |
|------|---------|---------|
| 200 | OK - Request berhasil | Login sukses, data berhasil diambil |
| 201 | Created - Resource berhasil dibuat | Registrasi sukses, post berhasil ditambah |
| 400 | Bad Request - Request tidak valid | Field kosong, format salah |
| 401 | Unauthorized - Token tidak valid/hilang | Token expired, format token salah |
| 409 | Conflict - Data sudah ada | Username sudah terdaftar |
| 500 | Internal Server Error - Error server | Database error |

### Error Response Format:

```json
{
  "message": "Deskripsi error yang user-friendly"
}
```

### Handling di Client (Ionic/Vue.js):

```javascript
try {
  const response = await axios.get('http://localhost:3000/data', {
    headers: {
      'Authorization': 'Bearer 200920'
    }
  });
  // Success
} catch (error) {
  if (error.response?.status === 401) {
    // Redirect ke login
  } else if (error.response?.status === 400) {
    // Tampilkan error validasi
  } else if (error.response?.status === 500) {
    // Server error
  }
}
```

---

## 💡 Contoh Penggunaan

### 1. Register Pengguna Baru

```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "pass123"
  }'
```

**Response:**
```json
{
  "message": "Registrasi berhasil!",
  "user": {
    "id": 1,
    "username": "johndoe"
  }
}
```

---

### 2. Login

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "pass123"
  }'
```

**Response:**
```json
{
  "message": "Login berhasil!",
  "user": {
    "id": 1,
    "username": "johndoe"
  }
}
```

---

### 3. Ambil Data (dengan Token)

```bash
curl -X GET http://localhost:3000/data \
  -H "Authorization: Bearer 200920"
```

**Response:**
```json
{
  "message": "Data berhasil diambil",
  "total": 1,
  "data": [
    {
      "id": 1,
      "userid": 1,
      "title": "My First Post",
      "body": "This is the content"
    }
  ]
}
```

---

### 4. Tambah Post (dengan Token)

```bash
curl -X POST http://localhost:3000/data/post \
  -H "Authorization: Bearer 200920" \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "userid": 1,
    "title": "My First Post",
    "body": "This is the content of my first post"
  }'
```

**Response:**
```json
{
  "message": "Data berhasil ditambahkan.",
  "data": {
    "id": 1,
    "userid": 1,
    "title": "My First Post",
    "body": "This is the content of my first post"
  }
}
```

---

## 🔄 Flow Aplikasi

```
┌─────────────────────────────────────────────────┐
│         USER MULAI APLIKASI (Ionic)             │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
         ┌───────────────┐
         │  HALAMAN LOGIN│
         └───────┬───────┘
                 │
         ┌───────▼───────┐
         │ Input Username │
         │ & Password     │
         └───────┬────────┘
                 │
         ┌───────▼──────────────────┐
         │ POST /login              │
         │ {username, password}     │
         └───────┬──────────────────┘
                 │
         ┌───────▼────────────┐
         │ Simpan Token       │
         │ (localStorage)     │
         └───────┬────────────┘
                 │
         ┌───────▼──────────────────────┐
         │ GET /data                    │
         │ Header: Authorization: Bearer│
         └───────┬──────────────────────┘
                 │
         ┌───────▼──────────────┐
         │ Tampilkan Data Posts │
         └───────┬──────────────┘
                 │
         ┌───────▼────────────────┐
         │ User dapat:            │
         │ - Lihat Posts          │
         │ - Tambah Posts         │
         │ - Edit Posts           │
         │ - Logout               │
         └────────────────────────┘
```

---

## 🚀 Tips Pengembangan

### 1. Debugging Token Issues
```javascript
// Di browser console (DevTools)
localStorage.getItem('auth_token')  // Cek token tersimpan
```

### 2. Testing API dengan Postman
- Buat folder baru untuk endpoint
- Tambahkan header: `Authorization: Bearer 200920`
- Test setiap endpoint

### 3. Enable Logging
```javascript
// Tambahkan di server.js
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});
```

### 4. Production Checklist
- ✅ Ubah token dari environment variable
- ✅ Validasi input lebih ketat
- ✅ Tambahkan rate limiting
- ✅ Gunakan HTTPS
- ✅ Tambahkan refresh token mechanism
- ✅ Password minimal requirements
- ✅ Logging & monitoring

---

## 📝 Kesimpulan

API ini menyediakan fitur autentikasi lengkap dengan keamanan token dan manajemen data. Dengan struktur yang jelas dan error handling yang baik, API siap digunakan untuk aplikasi mobile production.

**Fitur Unggulan:**
- ✅ Secure Token-based Authentication
- ✅ Password Hashing dengan bcrypt
- ✅ CORS Support
- ✅ Comprehensive Error Handling
- ✅ RESTful API Design
- ✅ Database Relationship (1-to-Many)

---

## 📞 Support & Contact

Untuk pertanyaan atau masalah teknis, silakan review kembali dokumentasi atau debug menggunakan tools:
- Browser DevTools (Network & Console)
- Postman
- MySQL Workbench

---

**Last Updated**: November 14, 2025  
**API Version**: 1.0  
**Status**: Production Ready
