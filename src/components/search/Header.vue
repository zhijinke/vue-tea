<template>
  <div>
    <header>
      <div class="search-return" @click="goBack">
        <i class="iconfont icon-fanhui"></i>
      </div>
      <div class="search-main">
        <i class="iconfont icon-fangdajing"></i>
        <form action="" onsubmit="return false" @keyup.enter="goDetail">
          <input
            type="search"
            v-model="searchVal"
            ref="myInput"
            placeholder="搜索您喜欢的产品..."
          />
        </form>
      </div>
      <div class="serach-btn" @click="goDetail">搜索</div>
    </header>
  </div>
</template>

<script>
import { json } from "body-parser";

export default {
  data() {
    return {
      searchVal: this.$route.query.key || "",
      searchArr: [],
    };
  },
  mounted() {
    // 键盘监听事件
    window.addEventListener("touchmove", this.myTouchMove, true);
  },
  methods: {
    myTouchMove() {
      //  失去焦点
      this.$refs.myInput.blur();
    },
    goBack() {
      this.$router.back();
    },
    goDetail() {
      // 判断输入框是否为空
      if (!this.searchVal.trim()) return;
      //判断之前有没有搜索的本地存储
      if (!localStorage.getItem("searchList")) {
        // 没有
        localStorage.setItem("searchList", "[]");
      } else {
        // 之前有
        this.searchArr = JSON.parse(localStorage.getItem("searchList"));
      }
      // 增加数据
      this.searchArr.unshift(this.searchVal);
      // 数组去重ES6
      let newArr = [...new Set(this.searchArr)];
      // 给本地存储赋值
      localStorage.setItem("searchList", JSON.stringify(newArr));
      // 路由跳转判断，如果是同一个页面，则不进行跳转
      if (this.searchVal == this.$route.query.key) return;

      // 跳转
      this.$router.push({
        name: "list",
        query: {
          key: this.searchVal,
        },
      });
    },
  },
};
</script>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 1.173333rem;
  color: #fff;
  background-color: #b0352f;
}
.search-return,
.serach-btn {
  padding: 0 0.266666rem;
}
.search-return i {
  font-size: 0.746666rem;
}
.search-main {
  display: flex;
  align-items: center;
  width: 6.933333rem;
  height: 0.8rem;
  border-radius: 12px;
  background-color: #ffffff;
}
.search-main i {
  padding: 0 0.266666rem;
  color: #666666;
}
.search-main form {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}
.search-main form input {
  width: 100%;
  font-size: 15px;
  color: black;
}
.serach-btn {
  font-size: 0.426666rem;
}
</style>
