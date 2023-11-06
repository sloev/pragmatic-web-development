<script setup>
import { RouterLink, RouterView } from "vue-router";
import { onMounted, watch } from "vue";
import { useSettingsStore } from "./store/settings";
import { useDbStore } from "./store/db";
const settingsStore = useSettingsStore();
const dbStore = useDbStore();
const ADMINPUB = "vzfLhrO7PqQqXGcH7FNWE9bvu9UTAOWF3PsW5pusib0.rV-lGACnUqeYN3GeJuq7SMFBxqznulGT-xdsDGSPt7k"

onMounted(async()=>{
  let admin = await dbStore.load(ADMINPUB)
});
</script>

<template>
  <div class="main">
    <RouterView />
  </div>
</template>

<style scoped></style>
