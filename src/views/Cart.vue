<template>
  <div class="cart container">
    <header>
      <i class="iconfont icon-fanhui" @click="goPrev"></i>
      <span>购物车</span>
      <span @click="isOver">{{ isShow ? "编辑" : "完成" }}</span>
    </header>
    <section class="container" v-if="list.length">
      <div class="cart-title">
        <van-checkbox @click="checkAllFn" :value="isCheckedAll"></van-checkbox>
        <span>商品</span>
      </div>
      <ul>
        <li v-for="(item, index) in list" :key="index">
          <div class="check">
            <van-checkbox
              @click="checkedItem(index)"
              v-model="item.checked"
            ></van-checkbox>
          </div>
          <h2>
            <img :src="item.goods_imgUrl" alt="" />
          </h2>
          <div class="goods">
            <div class="goods-title">
              <span>{{ item.goods_name }}</span>
              <i
                class="iconfont icon-lajitong"
                @click="delGoodsFn(item.id)"
              ></i>
            </div>
            <div class="goods-price">¥{{ item.goods_price }}</div>
            <van-stepper
              @change="changeNum($event, item)"
              v-model="item.goods_num"
              integer
            />
          </div>
        </li>
      </ul>
    </section>
    <section class="container" v-else>
      <h4>暂无数据</h4>
      <router-link to="/home">去首页逛逛吧</router-link>
    </section>
    <footer v-if="list.length">
      <div class="radio">
        <van-checkbox @click="checkAllFn" :value="isCheckedAll"></van-checkbox>
      </div>
      <div class="total" v-if="isShow">
        <div>
          共有
          <span class="total-active">{{ total.num }}</span>
          件商品
        </div>
        <div>
          <span>总计：</span>
          <span class="total-active"
            >¥{{ total.price.toFixed(2) }} + 0茶币</span
          >
        </div>
      </div>
      <div class="order" v-if="isShow" @click="goOrder">去结算</div>
      <div class="order" @click="delGoodsFn" v-else>删除</div>
    </footer>
  </div>
</template>


<script>
import http from "@/common/api/request.js";
import { Toast } from "mint-ui";
import { mapState, mapMutations, mapActions, mapGetters } from "vuex";
export default {
  name: "Cart",
  data() {
    return {
      checked: true,
      isShow: true,
      
    };
  },
  created() {
    this.getData();
  },
  computed: {
    ...mapState({
      list: (state) => state.cart.list,
      selectList: (state) => state.cart.selectList,
    }),
    goodsList(){
            return this.selectList.map(id=>{
              return this.list.find(v=>v.id == id);
          })
        },
    ...mapGetters(["isCheckedAll", "total"]),
  },
  methods: {
    ...mapMutations(["cartList", "checkedItem", "saveOrderCode"]),
    ...mapActions(["checkAllFn", "delGoodsFn"]),
    goPrev() {
      this.$router.push("/home");
    },
    // 发送请求，获取购物车数据
    getData() {
      http
        .$axios({
          url: "/api/selectCart",
          method: "post",
          headers: {
            token: true,
          },
        })
        .then((res) => {
          // 给每个数据加个check字段
          res.data.forEach((v) => {
            v["checked"] = true;
          });
          this.cartList(res.data);
        });
    },
    // 编辑、完成
    isOver() {
      this.isShow = !this.isShow;
    },
    // 改变商品数量
    /*
            value 是商品数量的值
            item.id 是 goods_cart 里商品的id
         */
    changeNum(value, item) {
      // 发送请求
      http.$axios({
        url: "/api/changeNum",
        method: "post",
        headers: {
          token: true,
        },
        data: {
          newNum: value,
          id: item.id,
        },
      });
    },
    goOrder() {
        // 判断是否为空
        if (this.selectList.length) {
            // 要传递的参数
      let goods = [];
      this.selectList.forEach((id) => {
        this.list.forEach((v) => {
          if (id == v.id) {
            goods.push(v);
          }
        });
      });
      // 发送请求，生成订单，后端返回订单号
      http.$axios({
          url: "/api/addOrder",
          method: "post",
          headers: {
            token: true,
          },
          data: {
            goods,
          },
        })
        .then((res) => {
          if (!res.success) return;
          this.saveOrderCode(res.data);

          this.$router.push({
                path: "/order",
                query: {
                  detail: JSON.stringify(this.selectList),
                  goodsList:JSON.stringify(this.goodsList),
                },
              });
        });

            } else {
              Toast("至少选择一件商品！");
              return;
            }
    },
  },
};
</script>
<style scoped lang="scss">
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 1.173333rem;
  color: #fff;
  background-color: #b0352f;
  i {
    padding: 0 0.4rem;
    font-size: 0.586666rem;
  }
  span {
    padding: 0 0.4rem;
    font-size: 0.426666rem;
  }
}
section {
  background-color: #f5f5f5;
  .cart-title {
    display: flex;
    padding: 0.533333rem;
    span {
      padding: 0 0.4rem;
      font-weight: 500;
      font-size: 0.48rem;
    }
  }
  ul {
    display: flex;
    flex-direction: column;
    li {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.16rem 0.533333rem;
      margin: 0.213333rem 0;
      background-color: #fff;
      .check {
        padding-right: 0.373333rem;
      }
      .goods {
        display: flex;
        flex-direction: column;
        padding-left: 0.4rem;
        font-size: 0.32rem;
        .goods-title {
          display: flex;
          i {
            font-size: 0.586666rem;
          }
        }
        .goods-price {
          padding: 0.08rem 0;
          color: #b0352f;
        }
        ::v-deep .van-stepper {
          text-align: right;
        }
      }
      img {
        width: 1.973333rem;
        height: 1.973333rem;
      }
    }
  }
}
footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 1.28rem;
  border-top: 0.053333rem solid #ccc;
  .radio {
    padding: 0 0.4rem;
  }
  .total {
    flex: 1;
    font-size: 0.32rem;
    .total-active {
      color: #b0352f;
    }
  }
  .order {
    width: 3.2rem;
    line-height: 1.28rem;
    color: #fff;
    text-align: center;
    font-size: 0.426666rem;
    background-color: #b0352f;
  }
}
</style>

