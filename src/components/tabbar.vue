<template>
  <div class="tabbar">
      <ul>
        <li @click="jumpPage(item.path)" v-for="(item,index) in tabbar" :key="index" >
          
          <img :src="$route.path.includes(item.path)?item.active:item.unactive">
          <span><a href="#" :class='$route.path.includes(item.path)?"active":"" '>{{item.text}}</a></span>
          <!-- <span :class='$route.path.includes(item.path)?"active":"" '>{{item.text}}</span> -->
        </li>
      </ul>
  </div>
</template>

<script>
export default {
    name:'tabbar',
    data() {
      return {
        tabbar:[
          {
            unactive:'./tabbar/home1.png',
            active:'./tabbar/home2.png',
            text:'首页',
            path:'/home'
          },
          {
            unactive:'./tabbar/category1.png',
            active:'./tabbar/category2.png',
            text:'分类',
            path:'list'
          },
          {
            unactive:'./tabbar/cart1.png',
            active:'./tabbar/cart2.png',
            text:'购物车',
            path:'cart'
          },
          {
            unactive:'./tabbar/profile1.png',
            active:'./tabbar/profile2.png',
            text:'我的',
            path:'my'
          },
        ],
      }
    },
    methods:{
      jumpPage(path){
        // 解决同一个路由连点两次出错的问题
        if(this.$route.path=='/'+ path || this.$route.path == path) return
        // 路由跳转
        this.$router.replace(path)
      }
    }
}
</script>

<style scoped>
.tabbar{
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 3.375rem;
  background: #fff;
  z-index: 9999;
}
ul{
  display: flex;
  justify-content: space-around;
  height: 3.375rem;
}
.tabbar ul li{
  justify-content: space-around;
  margin: auto 0;
}
.tabbar ul li img{
  height: 1.5rem;
  text-align: center;
  margin: 0 auto;
  display: block;
  margin-bottom: .1875rem;
}
.tabbar ul li span{
  font-size:.75rem;
  text-align: center;
  justify-content: space-around;

}
.tabbar ul li span a{
  text-decoration: none;
  color: black;
  text-align: center;
  display: block;
}
.active{
  color: #1296db !important;
}
</style>