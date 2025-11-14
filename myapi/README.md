# Menggunakan Token dengan Ionic Vue (Login Page)

Panduan singkat ini menjelaskan cara menggunakan token (statis `200920` atau token dari server jika tersedia) di aplikasi Ionic + Vue Anda. Fokus: menambahkan token di halaman Login, menyimpan token, dan mengatur Axios agar mengirim header `Authorization` pada permintaan selanjutnya.

> Asumsi
- API lokal berjalan di `http://localhost:3000`.
- Server menerima token statis `200920` melalui header:
  Authorization: Bearer 200920
- Endpoint login berada di `POST /login` dan akan merespons dengan `response.data` (jika server juga mengembalikan token, README ini juga menanganinya).

## 1) Alur singkat
1. User mengisi username & password di halaman Login.
2. Aplikasi mengirim POST ke `/login`.
3. Jika login berhasil, simpan token ke `localStorage` dan set header default Axios.
4. Permintaan selanjutnya otomatis menyertakan header `Authorization: Bearer <token>`.

Catatan: jika server Anda TIDAK mengembalikan token di response login, Anda tetap dapat menggunakan token statis `200920` (mis. untuk dev) — README ini menunjukkan kedua cara.

---

## 2) Modifikasi `handleLogin` di halaman Login (Ionic Vue)
Berikut contoh lengkap fungsi `handleLogin` yang menyesuaikan dengan kode Anda. Contoh ini akan:
- Menyimpan response user.
- Jika `response.data.token` ada: gunakan token itu.
- Jika tidak ada token di response: gunakan token statis `200920`.
- Set header default Axios supaya permintaan selanjutnya mengirim header Authorization.

Ganti `API_URL` jika perlu.

```ts
const API_URL = 'http://localhost:3000/login';

const handleLogin = async () => {
  error.value = '';
  if (!username.value || !password.value) {
    error.value = 'Username dan Password wajib diisi.';
    return;
  }

  isLoading.value = true;

  try {
    const response = await axios.post(API_URL, {
      username: username.value,
      password: password.value,
    });

    // Simpan user (jika ada info user di response)
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data.user || response.data));

      // Ambil token dari response (jika server mengirim token)
      let token = response.data.token;

      // Jika server TIDAK mengirim token, fallback ke token statis (dev)
      if (!token) {
        token = '200920'; // token statis sesuai permintaan Anda
      }

      // Simpan token ke localStorage
      localStorage.setItem('auth_token', token);

      // Set header default di axios untuk permintaan selanjutnya
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Redirect
      router.replace('/tabs/tab1');

    } else {
      error.value = 'Login berhasil, tetapi respons API tidak lengkap.';
    }

  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response) {
      error.value = err.response.data.message || 'Kredensial tidak valid.';
    } else {
      error.value = 'Gagal terhubung ke server. Pastikan API berjalan di http://localhost:3000.';
    }
  } finally {
    isLoading.value = false;
  }
};
```

Catatan keamanan: jangan gunakan token statis di aplikasi produksi. Untuk development lokal token statis mempermudah pengujian.

---

## 3) Menyiapkan Axios saat aplikasi mulai
Agar semua request otomatis menyertakan header Authorization jika token ada, tambahkan kode inisialisasi di tempat yang dieksekusi sekali saat aplikasi start (mis. `main.ts` atau file store).

```ts
// main.ts atau src/plugins/axios.ts
import axios from 'axios';

const token = localStorage.getItem('auth_token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Optional: set base URL
axios.defaults.baseURL = 'http://localhost:3000';

export default axios;
```

Lalu impor file ini di `main.ts` agar berjalan sebelum komponen dipasang.

---

## 4) Contoh menggunakan token di request lain
Setelah login, Anda bisa memanggil endpoint yang dilindungi seperti ini:

```ts
// Ambil data
const resp = await axios.get('/data'); // header Authorization sudah ditambahkan otomatis
console.log(resp.data);

// Menambah data
await axios.post('/data/post', { id: '1', userid: 'alice', title: 'Hai', body: 'Isi' });
```

Jika Anda tidak ingin menggunakan `axios.defaults`, Anda bisa menambahkan header per-request:

```ts
const token = localStorage.getItem('auth_token');
await axios.get('/data', { headers: { Authorization: `Bearer ${token}` } });
```

---

## 5) Menambahkan route guard (optional)
Untuk mencegah user mengakses halaman tertentu bila belum login, gunakan `beforeEach` pada router.

```ts
// router/index.ts
router.beforeEach((to, from, next) => {
  const requiresAuth = to.meta.requiresAuth; // set meta pada route
  const token = localStorage.getItem('auth_token');
  if (requiresAuth && !token) {
    next('/login');
  } else {
    next();
  }
});
```

Di route yang memerlukan auth, tambahkan `meta: { requiresAuth: true }`.

---

## 6) Logout
Bersihkan token & header Axios:

```ts
const logout = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  delete axios.defaults.headers.common['Authorization'];
  router.replace('/login');
};
```

---

## 7) Debugging cepat
- Jika Anda mendapatkan 401 Unauthorized, cek:
  - Apakah header Authorization dikirim? (gunakan DevTools Network tab)
  - Apakah nilai header persis `Bearer 200920` (atau token valid yang server keluarkan)?
  - Restart server jika Anda baru mengubah `server.js`.
- Tes cepat via curl / PowerShell:

PowerShell:
```powershell
$headers = @{ Authorization = 'Bearer 200920' }
Invoke-RestMethod -Method Get -Uri http://localhost:3000/data -Headers $headers
```

curl:
```
curl -H "Authorization: Bearer 200920" http://localhost:3000/data
```

---

## 8) Rekomendasi keamanan (untuk produksi)
- Jangan gunakan token statis di aplikasi frontend. Sebagai gantinya, gunakan:
  - Login yang mengeluarkan JWT dari server, lalu simpan token di tempat aman.
  - Gunakan HTTPS.
  - Pertimbangkan refresh token untuk sesi panjang.
- Simpan token minimal di memory atau Secure Storage (mobile) jika memungkinkan. `localStorage` rentan XSS.

---

Jika Anda mau, saya bisa:
- Membuat patch kecil pada halaman login Anda yang otomatis menyimpan token & set header (saya sudah menyertakan fungsi `handleLogin` di atas — mau saya terapkan langsung ke file komponen Anda?).
- Menambahkan contoh route guard ke router Anda.
- Mengganti penggunaan `localStorage` ke `@ionic/storage` untuk keamanan lebih baik di aplikasi mobile.

Mau saya terapkan perubahan kode langsung ke komponen login Anda? (jawab "ya" dan saya akan buat patch).