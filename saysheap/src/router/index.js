import { createRouter, createWebHistory } from 'vue-router'
import MapView from '../views/MapView.vue'
import ListView from '../views/ListView.vue'
import ProfileView from '../views/ProfileView.vue'
import SingleItemView from '../views/SingleItemView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/:catchAll(.*)",
      redirect: { path: "/map" },
    },
    {
      path: '/map',
      name: 'Map',
      component: MapView
    },
    {
      path: '/list',
      name: 'List',
      component: ListView
    },
    {
      path: '/profile',
      name: 'Profile',
      component: ProfileView
    },
    {
      path: '/create',
      name: 'Create',
      component: SingleItemView
    },
    {
      path: '/item/:itemId',
      name: 'See item',
      component: SingleItemView
    }
  ]
})

export default router
