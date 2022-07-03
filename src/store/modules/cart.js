import {
    CART_LIST,
    CHECKED_ALL,
    UN_CHECKED_ALL,
    CHECKED_ITEM,
} from './mutations-types'
import { Toast,Dialog } from 'vant';
import http from '@/common/api/request.js'
export default{
    state:{
        list:[], //购物车数据
        selectList:[] // 存放的购物车id 选中的
    },
    getters:{
        isCheckedAll(state){
            return state.list.length == state.selectList.length
        },
        total(state){
            let total = {
                num:0,
                price:0
            }
            state.list.forEach(v=>{
                if(v.checked){
                    total.num += parseInt(v.goods_num)
                    total.price += v.goods_num * v.goods_price
                }
            })
            return total
        }
    },
    mutations:{
        [CART_LIST]( state, cartArr){
            state.list = cartArr;
            state.selectList = state.list.map(v=>{
                return v.id;
            })
            
        },
        // 全选
        [CHECKED_ALL](state){
           state.selectList = state.list.map(v=>{
                v.checked = true
                return v.id
            })
        },
        // 全不选
        [UN_CHECKED_ALL](state){
            state.list.forEach(v=>{
                v.checked = false
            })
            state.selectList = []
        },
        // 单选
        [CHECKED_ITEM](state,index){
            // 循环查找selectList里面对应的id，没有就添加，有就删除
            let id = state.list[index].id
            let i = state.selectList.indexOf(id)
            if(i!=-1){
                // 说明selectList里有，删除
               return state.selectList.splice(i,1)
            }else{
                // 否则添加
                return state.selectList.push(id)
            }
        },
        // 删除
        delGoods( state ){
            state.list = state.list.filter(v=>{
                return state.selectList.indexOf( v.id ) == -1
            })
        }
    },
    actions:{
        checkAllFn({commit,getters}){
            getters.isCheckedAll ? commit('unCheckedAll') : commit('checkedAll')
        },
        // 删除购物车数据
        delGoodsFn({commit,state},id){
            //如果没有选中，则提示信息
            if( state.selectList.length == 0 ){
                Toast('请选择商品');
            }
            
            let arrCart = [];
            Dialog.confirm({
              message: '确定要删除这些商品吗？',
            }).then(() => {
                
                if( typeof id =='number' ){
                //当个删除
                    arrCart = [id];
                    let index = state.list.findIndex(v=>{
                        return v.id == id 
                    })
                    state.list.splice(index,1);
                }else{
                //多选删除
                    arrCart = state.selectList;
                    commit('delGoods');
                }
                
                http.$axios({
                	url:'/api/deleteCart',
                    method:'post',
                    
                    data:{
                       arrId:arrCart
                    }
                }).then(res=>{
                    
                    if( res.success ){
                        Toast(res.msg)
                    }
                })
            })
        }
    }
}