import {SELECT_ADDRESS,DEL_ADDRESS} from './mutations-types'
export default{
    state:{
        list:[]
    },
    getters:{
        defaultPath(state){
            return state.list.filter(v=>{
                return v.isDefault == 1
            })
        }
    },
    mutations:{
        // 获取数据库中用户对应的收货地址
        [SELECT_ADDRESS](state,arrRess){
            state.list = arrRess
        },
        // 删除购物车地址
        [DEL_ADDRESS](state,itemId){
           let index = state.list.forEach((item,index) => {
                if(item.id == itemId){
                    return index
                }
            });
            state.list.splice(index,1)
        },
    }
}