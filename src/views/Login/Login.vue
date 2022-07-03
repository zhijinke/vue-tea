<template>
	<div class='login container'>
		<Header></Header>
		<section>
			<div class='login-tel'>
				<input type="text" v-model="userTel" placeholder="请输入手机号" pattern="[0-9]*">
			</div>
			<div class='login-code'>
				<input type="text" v-model="userCode" placeholder="请输入短信验证码" pattern="[0-9]*">
				<button @click="getCode" :disabled="disabled">{{msg}}</button>
			</div>
			<div class='login-btn' @click="login">登 录</div>
			<div class='tab'>
				<span @click='goUserLogin'>密码登录</span>
				<span @click="goRecovery">找回密码</span>
				<span @click="goRegister">快速注册</span>
			</div>
		</section>
		<Tabbar></Tabbar>
	</div>
</template>


<script>
import Tabbar from '@/components/common/Tabbar.vue'
import Header from './Header.vue'
import { Toast } from 'mint-ui';
import http from '@/common/api/request.js'
export default{
	components:{
		Header,
		Tabbar
	},
	data(){
		return{
			userTel:'',
			// 验证规则
			rules:{
				// 手机号验证
				userTel:{
					rule:/^1[23456789]\d{9}$/,
					msg:'手机号不能为空，且必须是11位数字'
				},
			},
			disabled:false,
			msg:'获取短信验证码',
			codeNum:6,
			code:'',
			userCode:''
		}
	},
	methods:{
		// 跳转至找回密码页
		goRecovery(){
			this.$router.push('/recovery')
		},
		// 跳转至密码登录
		goUserLogin(){
			this.$router.push('/userLogin');
		},
		// 跳转至注册
		goRegister(){
			this.$router.push('/register')
		},
		// 点击按钮获取验证码
		getCode(){
			// 判断输入的手机号是否正确
			if( !this.validata('userTel') ) return 

			// 发送请求
			http.$axios({
				url:'/api/code',
				method:'POST',
				data:{
					phone:this.userTel
				}
			}).then(res=>{
				// console.log(res)
				this.code = res.data
			})

			let timer = setInterval(()=>{
				this.disabled = true
				this.msg = `重新发送${this.codeNum}`
				this.codeNum--
			},1000)
			setTimeout(()=>{
				clearInterval(timer)
				this.msg = '获取短信验证码'
				this.codeNum = 6
				this.disabled = false
			},7000)
		},
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
		// 用户登录
		login(){
			// 如果之前没有注册过，新增用户
			// 判断用户输入的验证码是否一致
			console.log(this.code , this.userCode)
			if(this.code == this.userCode){
				// alert(1)
				// 一致，发送请求
				http.$axios({
				url:'/api/addUser',
				method:'POST',
				data:{
					phone:this.userTel
				}
			}).then(res=>{
				// 登录成功 ，进行页面跳转。数据存储
				this.USER_LOGIN(res.data)
				this.$router.push('/my')
			})

			}
		}
	}
}
</script>


<style scoped lang='scss'>
section{
	display: flex;
	flex-direction: column;
	align-items: center;
	// font-size: 15px;
	font-size: .25rem;
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
	.login-code{
		display: flex;
		input{
			flex:1;
		}
		button{
			padding:0 0.533333rem;
			line-height: 1.173333rem;
			color:#fff;
			background-color: #b0352f;
			border:0;
			border-radius: 6px;
		}
	}
	.login-btn{
		line-height: 44px;
		color:#fff;
		text-align: center;
		background-color: #b0352f;
		border-radius: 6px;
	}
	.tab{
		display: flex;
		justify-content: space-between;
		font-size:0.373333rem;
	}
}
</style>

