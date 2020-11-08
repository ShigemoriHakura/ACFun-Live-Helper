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
    path: '/live',
    name: 'Live',
    component: () => import('../views/Live.vue'),
    meta: { navShow: true, }
  },
  {
    path: '/danmakuHime',
    name: 'danmakuHime',
    component: () => import('../views/danmakuHime.vue'),
    meta: { navShow: false, }
  },
  {
    path: '/danmakuFrame',
    name: 'danmakuFrame',
    component: () => import('../views/danmakuFrame.vue'),
    meta: { navShow: false, }
  },
  {
    path: '/account',
    name: 'Account',
    component: () => import('../views/Account.vue'),
    meta: { navShow: true, }
  },
  {
    path: '/mate',
    name: 'Mate',
    component: () => import('../views/Mate.vue'),
    meta: { navShow: true, }
  },
  {
    path: '/log',
    name: 'Log',
    component: () => import('../views/Log.vue'),
    meta: { navShow: true, }
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
