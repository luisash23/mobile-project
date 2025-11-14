<template>
  <ion-page>
     <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Data</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleLogout" color="danger">
            <ion-icon :icon="logOutOutline"></ion-icon>
            Logout
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>    <ion-content :fullscreen="true">

  <!-- Button to Add Data -->
  <ion-button color="light" expand="block" @click="router.push('/tabs/create')">Tambah Data</ion-button>

      <!-- Loading Indicator -->
      <div v-if="loading" class="ion-padding">
        <ion-spinner name="crescent"></ion-spinner>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="ion-padding-start ion-padding-end">
        <p class="error-text">Terjadi kesalahan saat mengambil data: {{ error.message }}</p>
      </div>

      <!-- List of Posts -->
      <ion-card v-for="post in posts" :key="post.id" style="margin: 20px; background-color: #44444E;">
        <ion-card-header>
          <ion-card-title style="color: white;">{{ post.title }}</ion-card-title>
          <ion-card-subtitle style="color: white;">User ID: {{ post.userId }} | Post ID: {{ post.id }}</ion-card-subtitle>
        </ion-card-header>

        <ion-card-content style="color: white;">
          <p>{{ post.body }}</p>
        </ion-card-content>

  <ion-button @click="router.push('/tabs/edit/' + post.id)" fill="clear" color="success">edit</ion-button>
        <!-- <ion-button fill="clear" color="danger" @click="deletePost(post.id)">Hapus</ion-button> -->
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonSpinner,
  IonButtons,
  IonIcon
} from '@ionic/vue';
import { useRouter } from 'vue-router';
import { logOutOutline } from 'ionicons/icons';

// Type definition for Post
interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

const router = useRouter();

// State management
const posts = ref<Post[]>([]);
const loading = ref(false);
const error = ref<Error | null>(null);

// Logout handler
const handleLogout = () => {
  try {
    localStorage.removeItem('user'); 
    router.push('/tabs/login');      
  } catch (err) {
    console.error('Error during logout:', err);
  }
};

// Fetch posts from API
const fetchPosts = async () => {
  const endpoint = 'http://localhost:3000/data';
  loading.value = true;
  error.value = null;

  try {
    // Attach token if present
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await axios.get(endpoint, { headers });
    console.log('[Tab1Page] fetchPosts response:', response);

    // Support multiple possible response shapes:
    // - API returns an array directly
    // - API returns { data: [...] }
    // - API returns { posts: [...] }
    const respData = response.data;
    if (Array.isArray(respData)) {
      posts.value = respData as Post[];
    } else if (Array.isArray(respData?.data)) {
      posts.value = respData.data as Post[];
    } else if (Array.isArray(respData?.posts)) {
      posts.value = respData.posts as Post[];
    } else {
      // Fallback: try to coerce to array or empty
      posts.value = [];
      console.warn('[Tab1Page] Unexpected response shape, setting posts to empty array');
    }
  } catch (err) {
    // If unauthorized, redirect to login
    const axiosErr: any = err;
    if (axiosErr?.response?.status === 401) {
      console.warn('[Tab1Page] Unauthorized (401) — redirecting to login');
      // clear stored user/token and redirect
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      router.replace('/tabs/login');
      return;
    }

    error.value = axiosErr as Error;
    console.error('Error fetching posts:', axiosErr?.message || axiosErr);
  } finally {
    loading.value = false;
  }
};

// Run the fetchPosts function when the component is mounted
onMounted(() => {
  fetchPosts();
});



</script>

<style scoped>
.error-text {
  color: red;
  font-weight: bold;
}
</style>
