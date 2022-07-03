import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

//公共css文件
import '@/assets/css/common.css'
//字体图标css文件
import '@/assets/css/iconfont.css'
//淘宝无线适配
import '@/assets/js/flexible'

//ly-tab插件
import LyTab from 'ly-tab'
Vue.use(LyTab)

// mint-ui
import MintUI from 'mint-ui'
import 'mint-ui/lib/style.css'

Vue.use(MintUI)

// vant
import Vant from 'vant'; 
import 'vant/lib/index.css'; 
Vue.use(Vant);

import fastClick from 'fastclick'
fastClick.attach(document.body)

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
  beforeCreate(){
    Vue.prototype.$bus = this // 注册全局事件总线
  }
}).$mount("#app");
