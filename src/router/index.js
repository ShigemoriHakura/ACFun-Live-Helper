import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { navShow: true, }
    
  },
  {
    path: '/danmakuHime',
    name: 'danmakuHime',
    component: () => import('../views/danmakuHime.vue'),
    meta: { navShow: false, }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
    meta: { navShow: true, }
  }
]

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes
})

export default router
