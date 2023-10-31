<script setup>
import { RouterLink, RouterView } from 'vue-router';
import NavBar from "./components/NavBar.vue"
import { onMounted } from 'vue'
import { useSheepStore } from './store/store'

const store = useSheepStore();



onMounted(() => {
  setTimeout(() => {
    store.setFollowMyLocation(true)

  }, 500);
})

</script>

<template>
  <div class="main">

    <RouterView />
    <NavBar />

  </div>
</template>

<style scoped>

</style>
