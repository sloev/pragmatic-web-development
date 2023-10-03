<script setup>

import BannerIcon from "./icons/icon.banner.png"



</script>

<template>
  <div class="banner-container">
    <div class="banner-item"> 
      <img :src="BannerIcon" alt="" />
    </div>
  </div>
</template>

<style scoped>
.banner-container {
  position: fixed;
  top: 0.5em;
  height:4em;
  z-index: 20;
  left: 50%;
  transform: translate(-50%, -0%);

}

.banner-item {
  display: flex;
  height:100%;

}
</style>
