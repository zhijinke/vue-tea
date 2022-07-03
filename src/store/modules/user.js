import {USER_LOGIN,INIT_USER,loginOut} from './mutations-types'
import { MessageBox } from 'mint-ui';
export default{

    state:{
        loginStatus:false, // 登录状态
        token:null, // token
        userInfo:{}, // 用户的信息，头像，昵称之类的
    },
    getters:{

    },
    mutations:{
        // 设置，存储信息
        [USER_LOGIN](state,user){
            state.loginStatus = true,
            state.token = user.token,
            state.userInfo = user,
            // 持久化存储
            localStorage.setItem('teaUserInfo',JSON.stringify(user))
        },
        // 读取
        [INIT_USER](state){
           let userInfo =  JSON.parse(localStorage.getItem('teaUserInfo'))
           if(userInfo){
                state.loginStatus = true,
                state.token = userInfo.token,
                state.userInfo = userInfo
           }
        },
        // 退出登录
        [loginOut](state){
            MessageBox.confirm('确定退出登录?').then(action => {
                state.loginStatus = false,
                state.token = '',
                state.userInfo = {},
                // 删除本地存储
                localStorage.removeItem('teaUserInfo')
            });
        }
    },
    actions:{

    }

}