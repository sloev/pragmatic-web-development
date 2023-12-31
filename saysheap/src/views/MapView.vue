<script setup>
import Banner from "../components/Banner.vue";
import "leaflet/dist/leaflet.css";
import { ref, watch, onMounted } from "vue";

import LookingIcon from "../components/icons/icon.looking.webp";
import LocationOnIcon from "../components/icons/icon.location.on.gif";
import LocationOffIcon from "../components/icons/icon.location.off.gif";
import WolfMarkerIcon from "../components/icons/icon.wolfmarker.png";
import NavBar from "../components/NavBar.vue";

import { useSettingsStore } from "../store/settings";

const settingsStore = useSettingsStore();

import L from "leaflet";

var wolfMarkerIcon = L.icon({
  iconUrl: WolfMarkerIcon,
  iconSize: [38, 44], // size of the icon
  iconAnchor: [25, 44], // point of the icon which will correspond to marker's location
  popupAnchor: [-3, -76], // point from which the popup should open relative to the iconAnchor,
});

import * as protomapsL from "protomaps-leaflet";

let map = null;
let zoomLevel = 16;
let wolfMarker = new L.Marker(settingsStore.currentLocation, { icon: wolfMarkerIcon });

const panToPosition = () => {
  wolfMarker.setLatLng(settingsStore.currentLocation);
  map.setView(settingsStore.viewPosition, map.getZoom(), {
    animate: true,
    pan: {
      duration: 1,
    },
  });
};

const setupMap = () => {
  map = L.map("map", { zoomControl: false });

  map.setView(settingsStore.viewPosition, zoomLevel);

  var layer = protomapsL.leafletLayer({
    url: "https://api.protomaps.com/tiles/v2/{z}/{x}/{y}.pbf?key=7120db229cd222aa",
  });
  layer.addTo(map);
  map.addLayer(wolfMarker);

  layer.addInspector(map);

  map.on("moveend", function (e) {
    settingsStore.setBoundingBox(map.getBounds());
  });

  map.on("dragend", function (event) {
    settingsStore.setBoundingBox(map.getBounds());
    var latlng = map.getCenter();
    settingsStore.setViewPosition(latlng);
  });

  watch(() => settingsStore.viewPosition, panToPosition);
};

onMounted(() => {
  setupMap();
});
</script>

<template>
  <div class="map-container">

    <div id="map"></div>



    <div class="follow" v-if="!settingsStore.gpsInitializing" @click="() => {
        settingsStore.setFollowMyLocation(!settingsStore.followMyLocation);
      }
      ">
      <img v-if="settingsStore.followMyLocation" :src="LocationOnIcon" alt="" />
      <img v-else :src="LocationOffIcon" alt="" />
    </div>
    <NavBar v-if="!settingsStore.gpsInitializing" />
    <transition name="looking-fade">
      <div class="looking" v-if="settingsStore.gpsInitializing" >
        <img  :src="LookingIcon" alt="" />
      </div>
    </transition>

    <Banner></Banner>
  </div>
</template>

<style scoped>
.looking-fade-enter-active,
.looking-fade-leave-active {
  transition: opacity 1.0s;
}

.looking-fade-enter,
.looking-fade-leave-to

/* .fade-leave-active below version 2.1.8 */
  {
  opacity: 0;
}

.looking {
  position: absolute;
  width: 100%;
  height:100%;
  z-index: 15;
  background-color: white;
}
.looking img {
  position: relative;
  top:15em;
  height:30em;
  left: 50%;
  transform: translate(-50%, -50%);

}

.follow {
  position: absolute;

  right: 2em;
  bottom: 12em;

  z-index: 10;
}

.follow img {
  width: 4em;
}

#map {
  position: absolute;

  height: 100%;
  width: 100%;
  z-index: 0;
  transition: opacity 0.5s;

}

.map-container {
  position: relative;

  width: 100%;
  height: 100%;
}
</style>
