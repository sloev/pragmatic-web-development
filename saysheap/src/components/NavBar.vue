<script setup>
import { RouterLink } from 'vue-router';
import MapIcon from "./icons/icon.map.png"
import ListIcon from "./icons/icon.list.png"
import PlusIcon from "./icons/icon.plus.png"
import ProfileIcon from "./icons/icon.profile.png"
import SearchIcon from "./icons/icon.search.png"



</script>

<template>
  <div class="navbar-container">
    <div class="navbar">
      
    <RouterLink class="nav-item" v-if="$route.path == '/map'" to="/list">
      <img :src="ListIcon" alt="" />
    </RouterLink>
    <RouterLink class="nav-item" v-else-if="$route.path == '/list'" to="/map">
      <img :src="MapIcon" alt="" />
    </RouterLink>


      <RouterLink class="nav-item" to="/search">
        <img :src="SearchIcon" alt="" />
      </RouterLink>


      <RouterLink class="nav-item" to="/create">
        <img :src="PlusIcon" alt="" />
      </RouterLink>


      <RouterLink class="nav-item" to="/profile">
        <img :src="ProfileIcon" alt="" />
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.navbar-container {
  position: fixed;
  bottom: 1em;
  left: 50%;
  transform: translate(-50%, -0%);
  z-index: 10;

}

.navbar {
  max-width: 600px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: 1fr;
  grid-column-gap: 1em;
  grid-row-gap: 0px;
}

.nav-item {
  height: 5em;
  margin: 0 auto;
  display: flex;
}
</style>
