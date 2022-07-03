import {SAVE_ORDER_CODE} from './mutations-types'
export default{
    state:{
        list:[],
        order_id: localStorage.getItem('tea_orderId') || ''
    },
    mutations:{
        [SAVE_ORDER_CODE](state,code){
            state.list = code
            state.order_id = code[0].order_id
            // 永久性储存
            localStorage.setItem('tea_orderId',code[0].order_id)
        }
    }
}