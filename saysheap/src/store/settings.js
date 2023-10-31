// store.js
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useLocalStorage } from "@vueuse/core"


export const useSettingsStore = defineStore('settingsStore', () => {
    const gpsInitializing = ref(false)
    const currentLocation = useLocalStorage('currentLocation', new L.LatLng(55.05982, 10.60677));
    const viewPosition = useLocalStorage('viewPosition', new L.LatLng(55.05982, 10.60677));
    const user = ref({})
    const boundingBox = ref({})
    const followMyLocation = useLocalStorage('followMyLocation', false)
    const locationWatchId = ref(-1)

    const setFollowMyLocation = (follow) => {
        followMyLocation.value = follow
    }

    watch(followMyLocation, () => {
        gpsInitialize()
    })
    
    const gpsInitialize = () => {

        if (followMyLocation.value && navigator.geolocation) {
            gpsInitializing.value = true

            locationWatchId.value = navigator.geolocation.watchPosition((position) => {
                let latitude = position.coords.latitude;
                let longitude = position.coords.longitude;
                var latLng = new L.LatLng(latitude, longitude)
                currentLocation.value = latLng;

                viewPosition.value = latLng;
                gpsInitializing.value = false

            }, (error) => {
                console.warn(error);
            }, { enableHighAccuracy: true });
        } else if (!followMyLocation.value && navigator.geolocation && locationWatchId.value != -1) {
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

    const setViewPosition = (latLng) => {
        viewPosition.value = latLng;
    }
    gpsInitialize();

    return { followMyLocation, setFollowMyLocation, gpsInitializing, currentLocation, viewPosition, setViewPosition, boundingBox, setBoundingBox, user, setUser }
})