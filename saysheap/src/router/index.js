import { createRouter, createWebHistory } from 'vue-router'
import MapView from '../views/MapView.vue'
import ListView from '../views/ListView.vue'
import ProfileView from '../views/ProfileView.vue'
import LoginView from '../views/LoginView.vue'
import SingleItemView from '../views/SingleItemView.vue'
import { useDbStore } from "../store/db";

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
      path: '/login',
      name: 'Login',
      component: LoginView
    },
    {
      path: '/item/:itemId',
      name: 'See item',
      component: SingleItemView
    }
  ]
})

router.beforeEach(async (to,from,next) => {
  // redirect to login page if not logged in and trying to access a restricted page
  const publicPages = ['/login'];
  const authRequired = !publicPages.includes(to.path);
  const dbStore = useDbStore();
  console.log("auth", authRequired, dbStore.user.loggedIn)
  if (authRequired && !dbStore.user.loggedIn) {
    const loginpath = window.location.pathname;
    next({ name: 'Login', query: { from: loginpath } });
  }
  else next();

});

export default router
