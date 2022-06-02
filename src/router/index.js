import Vue from 'vue'
import VueRouter from 'vue-router'
// import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path:'/',
    redirect:'/home'
  },
  {
    path: '/home',
    // name: 'Home',
    component: ()=>import('../views/Home.vue')
  },
  {
    path: '/list',
    name: 'List',
    component:()=>import('../views/List.vue')
  },
  {
    path: '/cart',
    name: 'Cart',
    component:()=>import('../views/Cart.vue')
  },
  {
    path: '/my',
    name: 'My',
    component:()=>import('../views/My.vue')
  },
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

const routerPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return routerPush.call(this, location).catch((error) => error)
}


export default router
