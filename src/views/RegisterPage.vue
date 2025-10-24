<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Register</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-list>
        <ion-item>
          <ion-input 
            label-placement="floating" 
            label="Username" 
            v-model="username" 
            type="text"
            required
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-input 
            label-placement="floating" 
            label="Email" 
            v-model="email" 
            type="email"
            required
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-input 
            label-placement="floating" 
            label="Password" 
            v-model="password" 
            type="password"
            required
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-input 
            label-placement="floating" 
            label="Konfirmasi Password" 
            v-model="confirmPassword" 
            type="password"
            required
          ></ion-input>
        </ion-item>
      </ion-list>

      <div class="ion-padding">
        <ion-button expand="block" :disabled="loading" @click="handleRegister">
          <ion-spinner v-if="loading" name="crescent"></ion-spinner>
          <span v-else>Register</span>
        </ion-button>

        <ion-button expand="block" fill="clear" @click="router.push('/tabs/login')">
          Sudah punya akun? Login
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonInput,
  IonButton,
  IonSpinner
} from '@ionic/vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

// Form fields
const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);

const handleRegister = async () => {
  // Basic validation
  if (!username.value || !email.value || !password.value || !confirmPassword.value) {
    alert('Mohon isi semua field');
    return;
  }

  if (password.value !== confirmPassword.value) {
    alert('Password dan konfirmasi password tidak cocok');
    return;
  }

  if (password.value.length < 6) {
    alert('Password minimal 6 karakter');
    return;
  }

  loading.value = true;

  try {
    const response = await axios.post('http://localhost:3000/register', {
      username: username.value,
      email: email.value,
      password: password.value
    });

    console.log('Register response:', response.data);
    
    if (response.data) {
      alert('Registrasi berhasil! Silakan login.');
      router.push('/tabs/login');
    }
  } catch (error: any) {
    console.error('Register error:', error);
    alert(error.response?.data?.message || 'Registrasi gagal, silakan coba lagi');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.ion-padding {
  padding: 16px;
}
</style>
