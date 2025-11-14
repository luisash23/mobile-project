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

        <ion-button expand="block" fill="clear" class="ion-margin-top" @click="router.push('/tabs/register')">Daftar
          Akun Baru</ion-button>
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
    const response = await axios.post(API_URL, {
      username: username.value,
      password: password.value,
    });

    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data.user || response.data));

      let token = response.data.token;

      if (!token) {
        token = '200920'; 
      }

      localStorage.setItem('auth_token', token);

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

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


</script>