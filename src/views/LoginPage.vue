<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Login</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Login</ion-title>
        </ion-toolbar>
      </ion-header>
      
      <div class="ion-padding">
        <ion-list>
          <ion-item>
            <ion-input label="Username" label-placement="floating" type="text" v-model="username"></ion-input>
          </ion-item>
          <ion-item>
            <ion-input label="Password" label-placement="floating" type="password" v-model="password"></ion-input>
          </ion-item>
        </ion-list>
        
        <ion-button expand="block" class="ion-margin-top" @click="handleLogin" :disabled="isLoading">
          {{ isLoading ? 'Loading...' : 'Masuk' }}
        </ion-button>
        
        <ion-button expand="block" fill="clear" class="ion-margin-top" @click="router.push('/tabs/register')" >Daftar Akun Baru</ion-button>
      </div>
      
      <ion-text color="danger" class="ion-padding" v-if="error">{{ error }}</ion-text>
      
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonList, IonItem, IonButton, IonText } from '@ionic/vue';

// Definisikan state menggunakan ref
const username = ref('');
const password = ref('');
const isLoading = ref(false); // Untuk tombol loading
const error = ref(''); // Untuk pesan error
const router = useRouter(); // Untuk navigasi setelah login

// URL API Localhost Anda
const API_URL = 'http://localhost:3000/login'; 

/**
 * Fungsi untuk menangani proses login
 */
const handleLogin = async () => {
    // 1. Reset state
    error.value = '';
    
    // 2. Validasi sederhana
    if (!username.value || !password.value) {
        error.value = 'Username dan Password wajib diisi.';
        return;
    }
    
    isLoading.value = true;

    try {
        // 3. Kirim permintaan POST ke API
        const response = await axios.post(API_URL, {
            username: username.value, // Pastikan nama key sesuai dengan yang diharapkan API Anda
            password: password.value, // Pastikan nama key sesuai dengan yang diharapkan API Anda
        });

        // 4. Proses respons sukses (status 2xx)
        console.log('Login response:', response.data);
        
        if (response.data) {
            // Simpan data user ke localStorage
            localStorage.setItem('user', JSON.stringify(response.data));
            
            // Simpan token jika ada
            if (response.data.token) {
                localStorage.setItem('auth_token', response.data.token);
            }
            
            // Redirect ke Tab1
            router.replace('/tabs/tab1');
            
        } else {
            // Jika API sukses tapi tidak memberikan data yang diharapkan
            error.value = 'Login berhasil, tetapi respons API tidak lengkap.';
        }

    } catch (err: any) {
        // 5. Tangani error (status 4xx atau kegagalan koneksi)
        if (axios.isAxiosError(err) && err.response) {
            // Error dari server (misalnya 401 Unauthorized)
            error.value = err.response.data.message || 'Kredensial tidak valid.';
        } else {
            // Error koneksi atau lainnya
            error.value = 'Gagal terhubung ke server. Pastikan API berjalan di localhost:8000.';
        }
    } finally {
        // 6. Selesai loading
        isLoading.value = false;
    }
};

// Pastikan Anda mengimpor semua komponen Ionic yang Anda gunakan di <template>
// IonInput, IonList, IonItem, IonButton, IonText
</script>