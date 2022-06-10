<template>
  <div class="search-index">
    <Header></Header>
    <section>
      <div class="search-history" v-if="this.searchList.length">
        <h2>
          <i class="iconfont icon-shijian"></i>
          <span>历史搜索</span>
          <span @click="deleteSearchList">清空历史记录</span>
        </h2>
        <ul>
          <li v-for="(item, index) in searchList" :key="index">{{ item }}</li>
        </ul>
      </div>
      <div v-else>暂无搜索记录</div>
    </section>
    <Tabbar></Tabbar>
  </div>
</template>

<script>
import Header from "@/components/search/Header.vue";
import Tabbar from "@/components/common/Tabbar.vue";
import { MessageBox } from "mint-ui";
export default {
  created() {
    this.searchList = JSON.parse(localStorage.getItem("searchList")) || [];
  },
  data() {
    return {
      searchList: [],
    };
  },
  components: {
    Header,
    Tabbar,
  },
  methods: {
    deleteSearchList() {
      MessageBox({
        title: "提示",
        message: "确定执行此操作?",
        showCancelButton: true,
      }).then((res) => {
        if (res == "confirm") {
          localStorage.removeItem("searchList");
          this.searchList = [];
        }
      });
    },
  },
};
</script>

<style scoped>
.search-index {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
.search {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
section {
  flex: 1;
  background-color: #f5f5f5;
  overflow: hidden;
}
.search-history h2 {
  position: relative;
  padding: 0.533333rem;
  font-weight: 400;
  font-size: 0.48rem;
}
.search-history h2 i {
  padding-right: 0.08rem;
  color: red;
  font-size: 0.48rem;
}
.search-history h2 span:last-child {
  position: absolute;
  right: 0.533333rem;
}
.search-history ul {
  display: flex;
  flex-wrap: wrap;
  padding: 0 0.266666rem;
}
.search-history ul li {
  margin: 0.266666rem;
  padding: 0.08rem 0.16rem;
  font-size: 0.373333rem;
  border: 1px solid #ccc;
}
</style>