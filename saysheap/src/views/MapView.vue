

<script setup>
import Banner from "../components/Banner.vue"
import 'leaflet/dist/leaflet.css';
import { ref, onMounted } from 'vue'

import LookingIcon from "../components/icons/icon.looking.gif"
import LocationOnIcon from "../components/icons/icon.location.on.gif"
import LocationOffIcon from "../components/icons/icon.location.off.gif"
import WolfMarkerIcon from "../components/icons/icon.wolfmarker.png"





import L from 'leaflet';

var wolfMarkerIcon = L.icon({
  iconUrl: WolfMarkerIcon,
  iconSize: [38, 44], // size of the icon
  iconAnchor: [25, 44], // point of the icon which will correspond to marker's location
  popupAnchor: [-3, -76], // point from which the popup should open relative to the iconAnchor,
});

import * as protomapsL from 'protomaps-leaflet';

let map = null;
let follow = ref(true)
let watchId = null;
let zoomLevel = 16
let wolfMarker = null;
let currentLocation = ref(new L.LatLng(55.05982, 10.60677));
let initialized = ref(false);

onMounted(() => {

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      let latitude = position.coords.latitude;
      let longitude = position.coords.longitude;
      map = L.map('map', { zoomControl: false })
      currentLocation.value = new L.LatLng(latitude, longitude)

      map.setView(currentLocation.value, zoomLevel);
      wolfMarker = new L.Marker(currentLocation.value, { icon: wolfMarkerIcon });

      var layer = protomapsL.leafletLayer({ url: 'https://api.protomaps.com/tiles/v2/{z}/{x}/{y}.pbf?key=7120db229cd222aa' })
      layer.addTo(map)
      map.addLayer(wolfMarker);

      layer.addInspector(map)
      watchId = navigator.geolocation.watchPosition(panToPosition, (error) => {
        console.warn(error);
      }, { enableHighAccuracy: true });
      initialized.value = true;

    })

  }
})

const panToPosition = (position) => {
  let latitude = position.coords.latitude;
  let longitude = position.coords.longitude;
  currentLocation.value = new L.LatLng(latitude, longitude)
  map.setView(currentLocation.value, map.getZoom(), {
    "animate": true,
    "pan": {
      "duration": 2
    }
  });

  console.warn(Date.now(), latitude, longitude)

}

const toggleFollow = () => {
  follow.value = !follow.value
  if (follow.value) {
    if (watchId != null) {
      navigator.geolocation.clearWatch(watchId);
    }
    watchId = navigator.geolocation.watchPosition(panToPosition, (error) => {
      console.warn(error);
    }, { enableHighAccuracy: true });
    if (currentLocation != null) {
      wolfMarker = new L.Marker(currentLocation.value, { icon: wolfMarkerIcon });

      map.addLayer(wolfMarker);
    }
  }
  else {
    if (wolfMarker != null) {
      map.removeLayer(wolfMarker);
      wolfMarker.value = null;

    }
  }
}



</script>

<template>
  <div>
    <transition name="looking-fade">
      <img class="looking" v-if="!initialized" :src="LookingIcon" alt="" />
    </transition>


    <div id="map"></div>
    <Banner></Banner>

    <div class="follow" @click="toggleFollow">
      <img v-if="follow" :src="LocationOnIcon" alt="" />
      <img v-else :src="LocationOffIcon" alt="" />
    </div>

  </div>
</template>

<style scoped>
.looking-fade-enter-active,
.looking-fade-leave-active {
  transition: opacity 0.5s;
}

.looking-fade-enter,
.looking-fade-leave-to

/* .fade-leave-active below version 2.1.8 */
  {
  opacity: 0;
}

.looking {
  position: fixed;
  top: 5em;
  width: 100%;
  z-index: 1;
}

.follow {
  position: fixed;
  bottom: 12em;
  right: 5em;
  z-index: 10;
}

.follow img {
  width: 4em;
}

#map {
  height: 100vh;
  margin: 0px;
  z-index: 0;
}
</style>