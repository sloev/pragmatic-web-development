// store.js
import { defineStore } from 'pinia'
import { ref } from 'vue'


export const useSheepStore = defineStore('sheepStore', () => {
    const gpsInitialized = ref(false)
    const currentLocation = ref(new L.LatLng(55.05982, 10.60677));
    const viewPosition = ref(new L.LatLng(55.05982, 10.60677));
    const user = ref({})
    const boundingBox = ref({})
    const followMyLocation = ref(true)
    const locationWatchId = ref(-1)

    const setFollowMyLocation = (follow) => {
        followMyLocation.value = follow
        if (followMyLocation && navigator.geolocation) {
            gpsInitialized.value = true

            locationWatchId.value = navigator.geolocation.watchPosition((position) => {
                let latitude = position.coords.latitude;
                let longitude = position.coords.longitude;
                var latLng = new L.LatLng(latitude, longitude)
                currentLocation.value = latLng;
                viewPosition.value = latLng;
            }, (error) => {
                console.warn(error);
            }, { enableHighAccuracy: true });
        } else if (!followMyLocation && navigator.geolocation && locationWatchId.value != -1) {
            navigator.geolocation.clearWatch(locationWatchId.value);
            locationWatchId.value = -1;
        }
    }

    
    const setBoundingBox = (bbox) => {
        boundingBox.value = bbox
    }

    const setUser = (usr) => {
        user.value = usr
    }

    const setViewPosition = (latLng)=>{
        viewPosition.value = latLng;
    }

    return { followMyLocation, setFollowMyLocation, gpsInitialized, currentLocation, viewPosition, setViewPosition,boundingBox, setBoundingBox, user, setUser }
})