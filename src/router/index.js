import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const originalPush = VueRouter.prototype.push
const originalReplace = VueRouter.prototype.replace
// push
VueRouter.prototype.push = function push (location, onResolve, onReject) {
  if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
  return originalPush.call(this, location).catch(err => err)
}
// replace
VueRouter.prototype.replace = function push (location, onResolve, onReject) {
  if (onResolve || onReject) return originalReplace.call(this, location, onResolve, onReject)
  return originalReplace.call(this, location).catch(err => err)
}

const routes = [
  {
    path: "/home",
    name: "Home",
    component: Home,
  },
  {
    path: "/",
    redirect:'/home'
  },
  {
    path: "/list",
    name: "List",
    component: () =>
      import("../views/List.vue"),
  },
  {
    path: "/cart",
    name: "Cart",
    component: () =>
      import("../views/Cart.vue"),
  },
  {
    path: "/my",
    name: "My",
    component: () =>
      import("../views/My.vue"),
  },
  {
    path: "/search",
    name: "Search",
    component: () =>import("../views/Search.vue"),
    children:[
      {
        path:'/',
        name:'index',
        component:()=>import("../views/SearchView/Search-index.vue")
      },
      {
        path:'list',
        name:'list',
        component:()=>import("../views/SearchView/SearchList.vue")
      }
    ]
  },
  {
    path: "/detail",
    name: "Detail",
    meta: {
      keepAlive: true,  //代表需要缓存
    },
    component: () =>
      import("../views/Detail.vue"),
  },
  {
    path:"/login",
    name:"/Login",
    component:()=>import("../views/Login/Login.vue")
  },
  {
    path:"/userLogin",
    name:"/UserLogin",
    component:()=>import("../views/Login/UserLogin.vue")
  },
  {
    path:"/register",
    name:"/Register",
    component:()=>import("../views/Login/Register.vue")
  },
  {
    path: "/recovery",
    name: "Recovery",
    component: () =>import("../views/Recovery/Recovery.vue"),
    children:[
      {
        path:'/',
        name:'RecoveryIndex',
        component:()=>import("../views/Recovery/RecoveryIndex.vue")
      },
      {
        path:'btn',
        name:'Btn',
        component:()=>import("../views/Recovery/Btn.vue")
      }
    ]
  },
  {
    path:"/path",
    name:"/Path",
    children:[
      {
        path:'/',
        name:'Path-Index',
        component:()=>import("../views/Path/Path-Index.vue")
      },
      {
        path:'path-list',
        name:'Path-List',
        component:()=>import("../views/Path/Path-list.vue")
      },
    ],
    component:()=>import("../views/Path.vue"),
  },
  {
    path:'/order',
    name:'Order',
    meta: {
      keepAlive: true,  //代表需要缓存
    },
    component:()=>import("../views/Order.vue")
  },
  {
    path:'/payment',
    name:'Payment',
    component:()=>import("../views/Payment.vue")
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

// 路由守卫
router.beforeEach((to,from,next)=>{
  let nextRoute = ['Payment','Cart','Path','Order','Path-Index','Path-List']
  // 判断是否在登录中
  let userInfo = JSON.parse(localStorage.getItem('teaUserInfo'))
  // 当前进入的页面，是不是需要验证哪些页面
  if(nextRoute.indexOf(to.name)>=0){
    if(!userInfo){
      router.push('/login')
    }
  }
  next()
})

export default router;
