<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Tambah Data Post</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content :fullscreen="true">
            <ion-header collapse="condense">
                <ion-toolbar>
                    <ion-title size="large">Tambah Data Post</ion-title>
                </ion-toolbar>
            </ion-header>
            <ion-list>
                <ion-item>
                    <ion-input label-placement="floating" label="Post ID" v-model="postId"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input label-placement="floating" label="Judul" v-model="judul"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input label-placement="floating" label="Deskripsi" v-model="deskripsi"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input label-placement="floating" label="User ID" v-model="userId"></ion-input>
                </ion-item>
            </ion-list>
            <ion-button color="medium" expand="block" size="small" @click="submitForm">Simpan Data</ion-button>
            <ion-button color="medium" expand="block" size="small" @click="() => router.push('/tabs/tab1')">Kembali
                ke tab Data</ion-button>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonButton, IonList, IonItem } from '@ionic/vue';
import { ref } from "vue";
import { useRouter } from 'vue-router';
import axios from "axios";

const router = useRouter();
const userId = ref("")
const judul = ref("")
const deskripsi = ref("")
const postId = ref("")

const submitForm = () => {
    const postData = {
        userid: userId.value,
        title: judul.value,
        body: deskripsi.value,
        id: postId.value
    };

    // SETELAH (Pastikan server.js sedang berjalan)
    axios.post('http://localhost:3000/data/post', postData)
        .then(response => {
            // Logika setelah sukses
            console.log('Data berhasil disimpan:', response.data);
            // Anda mungkin ingin menambahkan alert atau navigasi di sini
            alert(response.data.message);
            router.push('/tabs/tab1');
        })
        .catch(error => {
            // Logika jika ada error koneksi atau error dari server
            console.error('Gagal menyimpan data ke localhost:', error);
            alert('Gagal menyimpan data. Cek koneksi server lokal.');
        });
}


</script>