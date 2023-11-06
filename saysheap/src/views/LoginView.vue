<script setup>
import Banner from "../components/Banner.vue";
import "leaflet/dist/leaflet.css";
import { ref, toRaw, watch, onMounted } from "vue";

import { useSettingsStore } from "../store/settings";
import { useDbStore } from "../store/db";
import LoadingIcon from "../components/icons/icon.loading.gif";
import router from '../router'

const settingsStore = useSettingsStore();
const dbStore = useDbStore();

import L from "leaflet";

import * as protomapsL from "protomaps-leaflet";

let map = null;
let zoomLevel = 16;
let postingForm = ref(false)

let username;
let errorMessage = ref("");

let password;

const panToPosition = () => {
  map.setView(settingsStore.viewPosition, map.getZoom(), {
    animate: true,
    pan: {
      duration: 1,
    },
  });
};
const setupMap = () => {
  map = L.map("map", { zoomControl: false, panControl: false });

  map.setView(settingsStore.viewPosition, zoomLevel);

  var layer = protomapsL.leafletLayer({
    url: "https://api.protomaps.com/tiles/v2/{z}/{x}/{y}.pbf?key=7120db229cd222aa",
  });
  layer.addTo(map);

  map._handlers.forEach(function (handler) {
    handler.disable();
  });
  watch(() => settingsStore.viewPosition, panToPosition);
};

onMounted(() => {
  settingsStore.setFollowMyLocation(true);
  setupMap();
});

async function login () {
  postingForm.value = true
  try {
    let user = await dbStore.login(username, password);
    console.log("login success, user:", user)
    postingForm.value = false
    console.log("route",router.currentRoute.value.query)
    router.replace(router.currentRoute.value.query.from);
  } catch (e) {
    postingForm.value = false
    console.error("eror", e);
    errorMessage.value = "User not found";
    setTimeout(() => {
      errorMessage.value = "";
    }, 3000);
  }
};


const signUp = async () => {
  postingForm.value = true

  console.log("signUp")
  try {
    let user = await dbStore.createUser(username, password);
    console.log("created user:", user)
    postingForm.value = false
  } catch (e) {
    postingForm.value = false
    console.error("eror", e);
    errorMessage.value = "User already exists";
    setTimeout(() => {
      errorMessage.value = "";
    }, 3000);
  }
};
const createAdmin = async () => {
  postingForm.value = true

  console.log("createAdmin")
  try {
    let serverAdmin = await dbStore.create();
    await dbStore.load(serverAdmin.pub);
    console.log(serverAdmin.pub)
    postingForm.value = false
  } catch (e) {
    postingForm.value = false
    console.error("eror", e);
    errorMessage.value = "User already exists";
    setTimeout(() => {
      errorMessage.value = "";
    }, 3000);
  }
};
</script>

<template>
  <div class="map-container">
    <div id="map"></div>
    <transition name="looking-fade">
      <div class="looking" v-if="!dbStore.dbInitialized">
      </div>
    </transition>

    <Banner></Banner>
    <div class="login-form">

      <div id="username-group" class="input-group" :class="{ error: errorMessage.length != 0}">
        <label>Username </label>
        <input id="username" v-model="username" type="text" :disabled="postingForm"/>
      </div>
      <br />
      <div id="password-group" class="input-group" :class="{ error: errorMessage.length != 0 }">
        <label>Password </label>
        <input id="password" v-model="password" type="password" :disabled="postingForm"/>
        <div class="error-message">{{ errorMessage }}</div>
      </div>
      <br />
      <div class="input-group">

        <div class="spaced" >
          <button @click="login" :disabled="postingForm">login</button>
          <button @click="signUp" :disabled="postingForm">sign-up</button>
          <button @click="createAdmin" :disabled="postingForm">create_db</button>
        </div>
      </div>
     
    </div>
     
  </div>
</template>

<style scoped>
.looking-fade-enter-active,
.looking-fade-leave-active {
  transition: opacity 10.0s;
}

.looking-fade-enter,
.looking-fade-leave-to

/* .fade-leave-active below version 2.1.8 */
  {
  opacity: 0;
}



.login-form {
  position: absolute;
  bottom: 20em;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  border-radius: 25px;
  background: white;
  padding: 20px;
}

#map {
  position: absolute;

  height: 100%;
  width: 100%;
  z-index: 0;
}

.map-container {
  position: relative;

  width: 100%;
  height: 100%;
}

.looking {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;
  background-color: white;
}

.spaced {
  display: flex;
  justify-content: space-between;
}
</style>
