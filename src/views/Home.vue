<template>
  <div>
    <Header></Header>
    <ly-tab v-model="selectedId" :items="items" :options="options" @change='changeTab'> </ly-tab>
     <div v-for="(item,index) in res" :key="index">
      <section>
        <Swiper v-if="item.type == 'swiperList' " :swiper = "swiper"></Swiper>
      </section>
      <icons v-if="item.type == 'iconsList' " :icons="icons"></icons>
      <Recommend v-if="item.type == 'recommendList' " :Recommend="Recommend"></Recommend>
      <Like v-if="item.type == 'likeList' " :like="like"></Like>
      <Ad  :ad="ad"></Ad>
     </div>
    <tabbar></tabbar>
  </div>
</template> 

<script>
import axios from "axios"
import tabbar from "@/components/tabbar.vue"
import Header from "@/components/home/Header.vue"
import Swiper from "@/components/home/Swiper.vue"
import icons from "@/components/home/icons.vue"
import Recommend from "@/components/home/Recommend.vue"
import Like from "@/components/home/Like.vue"
import Ad from "@/components/home/Ad.vue"
export default {
  name: "Home",
  created(){
    this.getMessage()
  },
  components: { tabbar, Header,Swiper,icons,Recommend,Like,Ad},
  data() {
    return {
      selectedId: 0,
      value: "1",
      items: [],
      swiper:[],
      icons:[],
      Recommend:[],
      like:[],
      ad:[],
      res:[],
      resad:[],
      options: {
        activeColor: "red",
      },
    };
  },
  methods:{
    
   async getMessage(){
      let res = await axios({
        url:'/api/index_list/0/data/1'
      })
      this.res = res.data.data.data
      this.items = res.data.data.topBar
      this.swiper = res.data.data.data[0].data
      this.icons = res.data.data.data[1].data
      this.Recommend = res.data.data.data[2].data
      this.like = res.data.data.data[3].data
    },
    async addMessage(index){
      let res = await axios({
        url:'/api/index_list/'+index+'/data/1'
      });
      if( res.data.data.constructor !=Array ){
        this.res = res.data.data.data;
      }else{
        this.res = res.data.data;
      }
    },
    changeTab(item,index){
      this.addMessage(index)
    },
  }
};
</script>

<style scoped>

.ly-tab{
  margin-top: 2.75rem;
  background: #ffffff;
  /* color: red; */
  position: fixed;
  width: 100%;
  position: relative;
}
::v-deep .ly-tabbar{
  box-shadow:none !important;
	border-bottom:none !important;
}
.ly-tab-item{
  /* color: black; */
}
</style>

