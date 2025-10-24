<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Add Data</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content :fullscreen="true">
            <ion-header collapse="condense">
                <ion-toolbar>
                    <ion-title size="large">edit data</ion-title>
                </ion-toolbar>
            </ion-header>
            <ion-list>
                <ion-item>
                    <ion-input v-model="UserId" label-placement="floating" label="User Id"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input v-model="tittle" label-placement="floating" label="judul"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input v-model="body" label-placement="floating" label="deskripsi"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input v-model="postId" label-placement="floating" label="Post Id"></ion-input>
                </ion-item>
                <ion-button color="medium" expand="block" size="small" @click="submitform">Simpan Data</ion-button>
                <ion-button color="medium" expand="block" size="small" @click="() => router.push('/tabs/tab1')">Kembali
                    ke tab Data</ion-button>
            </ion-list>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonButton } from '@ionic/vue';
import axios from 'axios';
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const UserId = ref('')
const tittle = ref('')
const body = ref('')
const postId = ref('')
const route = useRoute();

axios.get(`http://localhost:3000/data/${route.params.id}`)
    .then(response => {
        const post = response.data;
        UserId.value = post.userId;
        tittle.value = post.title;
        body.value = post.body;
        postId.value = post.id;
    });


const submitform = () => {
    const postData = {
        userId: UserId.value,
        title: tittle.value,
        body: body.value,
        id: postId.value
    };
    axios.put(`http://localhost:3000/data/post/${route.params.id}`, postData)
        .then(response => {
            console.log('Data berhasil ubah:', response.data);
            alert('Data berhasil diubah');
        })
}



const router = useRouter();
</script>