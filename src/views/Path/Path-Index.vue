<template>
    <div class='path-index container'>
        <Header :pathStatus="pathStatus"></Header>
        <section class="container">
            <ul v-if="list.length">
                <li @click="goPathList(item)" v-for="(item,index) in list" :key="index">
                    <div>
                        <span>{{item.name}}</span>
                        <span>{{item.tel}}</span>
                    </div>
                    <div>
                        <span class='active' v-if="item.isDefault == 1">[默认]</span>
                        <span>{{item.province}}</span>
                        <span>{{item.city}}</span>
                        <span>{{item.county}}</span>
                        <span>{{item.addressDetail}}</span>
                    </div>
                </li>
            </ul>
            <h4 v-else>暂无数据</h4>
            <div class='add-path' @click="goPathList('add')">添加地址</div>
        </section>
        <Tabbar></Tabbar>
    </div>
</template>


<script>
import Header from '@/components/path/Header.vue'
import Tabbar from '@/components/common/Tabbar.vue'
import http from '@/common/api/request.js'
import { mapState,mapMutations } from 'vuex' 
export default{
    components:{
        Header,
        Tabbar
    },
    data() {
        return {
            pathStatus:false
        }
    },
    created(){
        this.getData()
        // 判断从那个页面进来的  证明是从订单页面进来的
        if(this.$route.query.type=='select'){
            this.pathStatus = true
        }
    },
    computed:{
        ...mapState({
            list:state=>state.path.list
        })
    },
    methods:{
        ...mapMutations(['selectAddress']),
        // 跳转修改地址||新增地址
        goPathList( value ){
            // 从订单页面进来 
            if(this.pathStatus){
                this.$bus.$emit('selectRess',JSON.stringify(value))
                this.$router.back()
                return
            }

            this.$router.push({
                name:'Path-List',
                params:{
                    key:value
                }
            })
        },
        // 获取数据库里的用户地址，并保存在vuex中
        getData(){
            http.$axios({
                url:'/api/seceltAddress',
                method:'post',
                headers:{
                    token:true
                }
            }).then(res=>{
                this.selectAddress(res)
            })
        }
    }
}
</script>


<style lang='scss' scoped>
section{
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #F7F7F7;
    ul{
        width: 100%;
        li{
            padding:0.266666rem 0.4rem;
            margin:0.16rem 0;
            background-color: #FFFFFF;
            span{
                padding-right:0.4rem;
                font-size:0.426666rem;
            }
            .active{
                color:#b0352f;
            }
        }
    }
    .add-path{
        margin-top:0.8rem;
        width: 3.2rem;
        line-height: 1.066666rem;
        font-size:0.48rem;
        text-align: center;
        color:#FFFFFF;
        background-color: #b0352f;
        border-radius: 6px;
    }
}
::v-deep .tabbar{
    border-top:2px solid #ccc;
    box-sizing: border-box;
    height: 60px;
}
</style>

