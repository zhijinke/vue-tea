import Vue from 'vue'
import App from './App.vue'
import router from './router/index'

// ly-tab 插件
import LyTab from 'ly-tab'
Vue.use(LyTab)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
