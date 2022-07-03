<template>
	<div class='login container'>
		<Header>
            <span>找回密码 / 修改密码</span>
        </Header>
		<section>
			<div class='login-tel'>
				<input type="text" v-model="userPwd" placeholder="请输入新密码">
			</div>
			
			<div class='login-btn' @click="updataPwd">确认</div>
			
		</section>
		<Tabbar></Tabbar>
	</div>
</template>

<script>
import { Toast } from 'mint-ui';
import Header from '../Login/Header.vue'
import Tabbar from '../../components/common/Tabbar.vue'
import http from '@/common/api/request.js'
export default {
    components:{
        Header,
        Tabbar
    },
    data(){
        return{
            userPwd:'',
            rules:{
				// 密码验证
				userPwd:{
					rule:/^\w{6,12}$/,
					msg:'密码不能为空，且要求为6-12位'
				}
			}
        }
    },
    methods:{
        // 验证信息提示
		validata( key ){
			let bool = true
			if(!this.rules[key].rule.test(this[key])){
				// 提示信息
				Toast(this.rules[key].msg);
				bool = false
				return false
			}
			return bool
		},
        updataPwd(){
            if( !this.validata('userPwd') ) return 
            // 前端验证通过，向后端发送请求，修改密码
            http.$axios({
                url:'/api/recovery',
                method:'POST',
                params:{
                    userTel:this.$route.params.userTel,
                    userPwd:this.userPwd
                }
            }).then(res=>{
                if(res.success){
                    Toast(res.msg);
                    this.$router.push('/login')
                }else if(!res.success){
                    Toast(res.msg);
				}
            })
        }
    }
}
</script>

<style scoped lang='scss'>
section{
	display: flex;
	flex-direction: column;
	align-items: center;
    flex: 1;
	background-color:#f5f5f5;
	div{
		margin:0.266666rem 0;
		width: 8.933333rem;
		height: 1.173333rem;
	}
	input{
		box-sizing: border-box;
		padding:0 0.266666rem;
		line-height: 1.173333rem;
		background-color: #FFFFFF;
		border:1px solid #ccc;
		border-radius: 6px;
	}
	.login-tel{
		margin-top:0.8rem;
		input{
			width: 8.933333rem;
		}
	}
	.login-btn{
		line-height: 44px;
		color:#fff;
		text-align: center;
		background-color: #b0352f;
		border-radius: 6px;
	}
}
</style>