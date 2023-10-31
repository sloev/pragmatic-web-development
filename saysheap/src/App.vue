<script setup>
import { RouterLink, RouterView } from "vue-router";
import NavBar from "./components/NavBar.vue";
import { onMounted, watch } from "vue";
import { useSettingsStore } from "./store/settings";


</script>

<template>
  <div class="main">
    <RouterView />
    <NavBar />
  </div>
</template>

<style scoped></style>
