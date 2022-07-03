<template>
    <div class='order container'>
        <header>
            <i class='iconfont icon-fanhui' @click='$router.back()'></i>
            <span>提交订单</span>
            <i class='iconfont icon-kefu'></i>
        </header>
        <section class="container">
            <div class='path'>
                <h3 class='path-title'>收货信息</h3>
                <div class='path-content' @click="changeInfo">
                   <div>
                       <span>{{path.name}}</span>
                       <span>{{path.tel}}</span>
                   </div>
                   <div>
                       <span>{{path.province}}</span>
                       <span>{{path.city}}</span>
                       <span>{{path.county}}</span>
                       <span>{{path.addressDetail}}</span>
                   </div>
                </div>
            </div>
            <div class='payment'>
                <div class='payment-title'>支付方式：</div>
                <van-radio-group v-model="radioPayment">
                  <van-radio name="wx">微信支付</van-radio>
                  <van-radio name="ali">支付宝支付</van-radio>
                </van-radio-group>
            </div>
            <div class='goods'>
                <ul>
                    <li
                        v-for='(item,index) in goodsList'
                        :key='index'
                    >
                        <div>
                            <img :src="item.goods_imgUrl" alt="">
                        </div>
                        <div class='goods-content'>
                            <span class="goods-text">{{item.goods_name}}</span>
                            <div class='goods-total'>
                                <span>¥{{item.goods_price}}</span>
                                <span>x{{item.goods_num}}</span>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </section>
        <footer>
            <div class='order-total'>
                <span>共</span>
                <b>{{total.num}}</b>
                <span>件,</span>
                <span>总金额：</span>
                <em>¥{{total.price}}</em>
            </div>
            <div class='order-topay' @click="subOrder">
                提交订单
            </div>
        </footer>
    </div>
</template>

<script>
import { Toast } from "mint-ui";
import { mapState,mapMutations,mapGetters } from 'vuex'
import http from '@/common/api/request.js'
import qs from 'qs'
export default {
    data(){
        return{
            radioPayment:'wx',
            path:{},
            item:[],
            total:{
                price:0,
                num:0
            }
        }
    },
    created(){
        // 接收选择的收货地址
        this.$bus.$on('selectRess',(data=>{
            this.path = JSON.parse(data) 
        }))

        this.getAddressDefault()
        this.item = JSON.parse(this.$route.query.detail)
        
        // 下方total所需的数据
        this.goodsList = JSON.parse(this.$route.query.goodsList)
        this.getData()
    },
    activated(){
        this.item = JSON.parse(this.$route.query.detail)
        
        // 下方total所需的数据
        this.goodsList = JSON.parse(this.$route.query.goodsList)
        this.getData()
    },
    computed:{
        ...mapState({
           list:state=>state.cart.list,
           order_id:state=>state.order.order_id,
           selectList:state=>state.cart.selectList
        }),
    },
    methods:{
        ...mapMutations(['selectAddress','saveOrderCode']),
        ...mapGetters(['defaultPath']),
       // 发送请求  获取收货地址
        getAddressDefault(){
            http.$axios({
                url:'/api/seceltAddress',
                method:'post',
                headers:{
                    token:true
                }
            }).then(res=>{
                this.selectAddress(res)
                let path = this.defaultPath()
                // 有默认地址
                if(path.length){
                    this.path = path[0]
                }else{
                    // 没有默认地址
                    this.path = res[0]
                }
            })
        },
        getData(){
            // 拿到订单id，发送请求，查询tatal的数据，防止刷新消失
            let order_id = this.order_id
            http.$axios({
                url:'/api/selectOrder',
                method:'post',
                headers:{
                    token:true
                },
                data:{
                    order_id
                }
            }).then(res=>{
                this.saveOrderCode(res.data)
               this.total = {
                    num:res.data[0].goods_num,
                    price:res.data[0].goods_price
                }
            })
        },
        // 切换收货地址
        changeInfo(){
            this.$router.push({
                path:'/path',
                query:{
                    'type':'select'
                }
            })
        },
        // 提交订单
        subOrder(){
            // 判断是否有收获地址
            if(!this.path){
                Toast('请选择收货地址！')
                return
            }
            // 发送请求，改变订单状态，-》待支付  ，并且删除数据库购物车中的商品
            let order_id = this.order_id
            http.$axios({
                url:'/api/ChangeOrder',
                method:'post',
                headers:{
                    token:true
                },
                data:{
                    order_id, // 订单id
                    selectList:this.selectList // 购买商品的id号
                }
            }).then(res=>{
                let newArr = [];
            this.goodsList.forEach(v=>{
                newArr.push( v.goods_name );
            })
            
            //支付传递的参数
            let dataOrder = {
                orderId:this.order_id,
                name:newArr.join(''),
                price:this.total.price
            }
            
            if( res.success ){
                //去支付
                http.$axios({
                	url:'/api/payment',
                    method:"post",
                    headers:{
                        token:true,
                        'Content-Type': 'application/x-www-form-urlencoded' 
                    },
                    //qs是增加安全性的序列化
                    data:qs.stringify(dataOrder)
                }).then(res=>{
                    if( res.success ){
                       //打开支付宝支付的页面
                       window.location.href = res.paymentUrl;
                    }
                })
                
            }
            })
        }
    }
}
</script>



<style lang='scss' scoped>
header{
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 1.173333rem;
    color:#fff;
    background-color: #b0352f;
    i{
        padding:0 0.4rem;
        font-size:0.586666rem;
    }
    span{
        font-weight:300;
        font-size:0.48rem;
    }
}
section{
    background-color: #f7f7f7;
    .path-title{
        padding: 0.4rem;
        font-size:0.48rem;
    }
    .path-content{
        padding:0.16rem 0.4rem;
        font-size:0.373333rem;
        background-color: #FFFFFF;
        span{
            padding-right:0.16rem;
        }
    }
    .payment{
        padding:0.16rem 0.4rem;
        margin-top:0.4rem;
        font-size:0.426666rem;
        background-color: #FFFFFF;
        .van-radio-group{
            display: flex;
            padding:0.16rem 0;
            .van-radio{
                padding-right:0.266666rem;
            }
        }
    }
    .goods{
        padding:0.16rem 0.4rem;
        margin-top:0.4rem;
        font-size:0.426666rem;
        background-color: #fff;
        ul{
            width: 100%;
            li{
                display: flex;
                 width: 100%;
                img{
                    width: 1.973333rem;
                    height: 1.973333rem;
                }
                .goods-content{
                    flex:1;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    padding-left:0.4rem;
                    .goods-text{
                        font-size: 0.32rem;
                    }
                    .goods-total{
                        display: flex;
                        justify-content: space-between;
                    }
                }
            }
        }


    }

}
footer{
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 1.2rem;
    border-top:1px solid #ccc;
    .order-total{
        font-size:0.426666rem;
        span{
            padding:0 0.16rem;
        }
        b{
            color:#b0352f;
        }
        em{
            font-size:0.48rem;
            color:#b0352f;
        }
    }
    .order-topay{
        width: 3.2rem;
        line-height: 1.2rem;
        color:#fff;
        font-size:0.426666rem;
        text-align: center;
        background-color: #b0352f;
    }

}
</style>