<template>
  <div class="search-list">
    <div class="headers">
      <Header></Header>
      <ul v-if="goodsList.length != 0">

        <li v-for="(item,index) in searchList.data" :key="index"
        @click="changeTab(index)"
        
        >
        <div :class=" searchList.currentIndex == index?'active':'' ">{{item.name}}</div>
        <div class="search-filter" v-if="index != 0">
            <i class="iconfont icon-arrow_up_fat"
                :class=" item.status == 1 ? 'active' : '' "
            ></i>
            <i class="iconfont icon-arrow_down_fat"
                :class=" item.status == 2 ? 'active' : '' "
            ></i>
          </div>
        </li>

      </ul>
      <h4 v-else>暂无搜索记录...</h4>
    </div>
    <section>
      <ul>
        <li v-for="(item,index) in goodsList " :key="index">
					<img v-lazy="item.imgUrl" alt="">
					<h3>{{item.name}}</h3>
					<div class='price'>
						<div>
							<span>¥</span>
							<b>{{item.price}}</b>
						</div>
						<div>立即购买</div>
					</div>
				</li>
      </ul>
    </section>
    <Tabbar></Tabbar>
  </div>
</template>

<script>
import http from '@/common/api/request.js'
import Header from "@/components/search/Header.vue";
import Tabbar from "@/components/common/Tabbar.vue";
export default {
	data() {
		return {
			goodsList:[],
      searchList:{
        currentIndex:0,
        /*
            status表示状态 ：1为asc，2为desc
        */
        data:[
          {name:'综合',key:'zh'},
          {name:'价格',status:0,key:'price'},
          {name:'销量',status:0,key:'num'}
        ]
      }
		}
	},
  created() {
    this.getData();
  },
  computed:{
    orderBy(){
      // 知道当前是哪一个对象
      let obj = this.searchList.data[this.searchList.currentIndex];
      // 要向后端传的是升序还是降序的值
      let val = obj.status == '1' ? 'asc' : 'desc'
      return {
        [obj.key]:val
      }
    }
  },
  methods: {
    getData() {
      http.$axios({
          url: "/api/goods/shopList",
          params: {
            searchName: this.$route.query.key,
            ...this.orderBy
          },
        })
        .then((res) => {
          this.goodsList = res
        });
    },
    changeTab(index){
      this.searchList.currentIndex = index
      let item = this.searchList.data[index]
      // 先把小箭头的状态值都改为0
      this.searchList.data.forEach((v,i)=>{
        if(i != index){
            v.status = 0
        }
      })
      // 修改当前对象小箭头的状态值
      if(index == this.searchList.currentIndex){
        item.status = item.status==1?2:1
      }
      // 再次发送请求
      this.getData()
    }
  },
  watch:{
	  $route(){
		  this.getData()
	  }
  },
  components: {
    Header,
    Tabbar,
  },
};
</script>


<style scoped>
.search-list {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
.headers ul {
  display: flex;
  justify-content: space-around;
  padding: 0.533333rem 0;
  font-size: 0.426666rem;
}
.headers ul li {
  display: flex;
  align-items: center;
}
.headers ul li > div {
  padding: 0 0.08rem;
}
.headers ul li .search-filter {
  display: flex;
  flex-direction: column;
}
section {
  flex: 1;
  overflow: hidden;
}
section ul {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}
section ul li {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  width: 50%;
  padding: 0.266666rem;
}
section ul li img {
  width: 4.533333rem;
  height: 4.533333rem;
}
section ul li img[lazy=loading] {
  width: 4.533333rem;
  height: 4.533333rem;
  background: gray;
}
section ul li h3 {
  width: 100%;
  font-size: 0.373333rem;
  color: #222;
  font-weight: 400;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
section ul li .price {
  display: flex;
  justify-content: space-between;
  padding: 0.266666rem 0;
  width: 100%;
  font-size: 14px;
}
section ul li .price div:first-child span {
  font-size: 0.32rem;
  color: #b0352f;
}
section ul li .price div:first-child b {
  color: #b0352f;
  font-size: 0.426666rem;
}
section ul li .price div:last-child {
  padding: 0.08rem 0.16rem;
  color: #fff;
  background-color: #b0352f;
  border-radius: 0.16rem;
}
.active{
  color: red;
}
</style>

