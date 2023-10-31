<script setup>
import Banner from "../components/Banner.vue";
import "leaflet/dist/leaflet.css";
import { ref, watch, onMounted } from "vue";

import LookingIcon from "../components/icons/icon.looking.gif";
import LocationOnIcon from "../components/icons/icon.location.on.gif";
import LocationOffIcon from "../components/icons/icon.location.off.gif";
import WolfMarkerIcon from "../components/icons/icon.wolfmarker.png";

import { useSheepStore } from "../store/store";

const store = useSheepStore();

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
let wolfMarker = new L.Marker(store.currentLocation, { icon: wolfMarkerIcon });

const panToPosition = () => {
  console.warn("panning");
  wolfMarker.setLatLng(store.currentLocation);
  map.setView(store.viewPosition, map.getZoom(), {
    animate: true,
    pan: {
      duration: 1,
    },
  });
};

const setupMap = () => {
  map = L.map("map", { zoomControl: false });

  map.setView(store.viewPosition, zoomLevel);

  var layer = protomapsL.leafletLayer({
    url: "https://api.protomaps.com/tiles/v2/{z}/{x}/{y}.pbf?key=7120db229cd222aa",
  });
  layer.addTo(map);
  map.addLayer(wolfMarker);

  layer.addInspector(map);

  map.on("moveend", function (e) {
    store.setBoundingBox(map.getBounds());
  });
  map.on("dragend", function (event) {
    store.setBoundingBox(map.getBounds());
    var latlng = map.getCenter();
    store.setViewPosition(latlng);
  });

  watch(() => store.currentLocation, panToPosition);
};

const triggerPan = () => {
  if (store.followMyLocation) {
    store.setViewPosition(store.currentLocation)
    panToPosition();
  }
};

onMounted(() => {
  setupMap();
});



watch(() => store.followMyLocation, triggerPan);

</script>

<template>
  <div class="map-container">
    <div id="map"></div>

    <transition name="looking-fade">
      <img class="looking" v-if="!store.gpsInitialized" :src="LookingIcon" alt="" />
    </transition>

    <Banner></Banner>

    <div
      class="follow"
      @click="
        () => {
          store.setFollowMyLocation(!store.followMyLocation);
        }
      "
    >
      <img v-if="store.followMyLocation" :src="LocationOnIcon" alt="" />
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

/* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

.looking {
  position: absolute;
  height: 100%;
  z-index: 1;
}

.follow {
  position: absolute;

  right: 2em;
  bottom: 12em;

  z-index: 2;
}

.follow img {
  width: 4em;
}

#map {
  position: absolute;

  height: 100%;
  width: 100%;
  z-index: 0;
}
.map-container {
  position: relative;

  max-width: 600px;
  width: 100%;
  height: 100%;
}
</style>
