<script setup>
import { useRoute } from 'vue-router';


const route = useRoute();  
const itemId = route.params.itemId;

</script>

<template>
  <p>Hi {{ itemId }}  </p>
</template>

<style>

</style>
