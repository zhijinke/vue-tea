<template>
	<div class='list'>
		<header v-if="show">
			<div class='returns' @click="goPrev">
				<i class='iconfont icon-fanhui'></i>
			</div>
			<div class='search'>
				<i class='iconfont icon-fangdajing'></i>
				<span>搜您喜欢的...</span>
			</div>
			<div class='go-home'>
				<img src="@/assets/images/home.png" alt="">
			</div>
		</header>
		<section>
			<div class='list-l' ref="left">
				<ul class='l-item'>
					<li @click="goScroll(index)" :class="{active:currentIndex==index}"  v-for="(item,index) in leftArr[0]" :key="index">{{item}}</li>
				</ul>
			</div>


			<div class='list-r' ref="right">
				<ul v-for="(item,index) in rightArr" :key="index">
					<li class='shop-list' v-for="(item,index) in item" :key="index">
						<h2>{{item.name}}</h2>
						<ul class='r-content'>
							<li v-for="(item,index) in item.list" :key="index">
								<img :src="item.imgUrl" alt="">
								<span>{{item.name}}</span>
							</li>
							
						</ul>
					</li>
				</ul>
			</div>
			
		</section>
		<Tabbar></Tabbar> 
	</div>

</template>

<script>
import BetterScroll from 'better-scroll'
import Tabbar from '@/components/common/Tabbar.vue'
import http from '@/common/api/request.js'
export default {
  name: "List",
  components:{
  	Tabbar
  },
  data(){
	return{
		show:true, // 显示头部
		leftArr:[],//左侧数据
		rightArr:[],//右侧数据
		allHeight:[],//右侧所有盒子的高度
		rightBScroll:'',//右侧滑动BScroll
		scrollY:''//右侧滚动距离
	}
  },
 async created(){
    await http.$axios({
		url:'/api/goods/list'
	})
	.then(res=>{
		// console.log(res)
		let leftData = []
		let rightData = []
		res.forEach(item => {
			leftData.push(item.name)
			rightData.push(item.data[0])
			// console.log(item.data[0])
		});
		this.leftArr.push(leftData)
		this.rightArr.push(rightData)
	})
	//当dom都加载完毕了再去执行
		this.$nextTick(()=>{
			// 左侧滑动
			new BetterScroll(this.$refs.left, {
			  click:true
			})
			//右侧滑动
			this.rightBScroll = new BetterScroll(this.$refs.right,{
				click:true,
				probeType:3,
				bounce:false
			});
			// 统计右侧所有板块的高度值，并放入数组中
			let height = 0
			this.allHeight.push(height)
			// 获取右侧每一块的高度
			let uls = this.$refs.right.getElementsByClassName('shop-list')
			// 将uls转为数组并循环
			Array.from(uls).forEach(item=>{
				height += item.clientHeight
				this.allHeight.push(height)
			})
			// 得到右侧滚动的值
			this.rightBScroll.on('scroll',(pos)=>{
				this.scrollY = Math.abs(pos.y)

				if(Math.abs(pos.y)>50){
					this.show = false
				}else{
					this.show = true
				}
			})
		})
  },
  methods:{
	goScroll(index){
		// 点击左侧右侧变化
		this.rightBScroll.scrollTo(0,-this.allHeight[index],300)
	},
	// 返回上一层
	goPrev(){
		this.$router.push('/home')
	}
  },
  computed:{
	currentIndex(){
		return this.allHeight.findIndex((item,index)=>{
			return this.scrollY >= item && this.scrollY < this.allHeight[index+1]
		})
	}
  }
};
</script>
<style scoped lang='scss'>
.list{
	display: flex;
	flex-direction: column;
	width: 100vw;
	height: 100vh;
	overflow: hidden;
}
header{
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 1.173333rem;
	background-color: #b0352f;
	.returns{
		line-height: 1.173333rem;
		padding:0 0.533333rem;
		i{
			color:#fff;
			font-size:0.693333rem;
		}
	}
	.search{
		display: flex;
		align-items: center;
		flex: 1;
		padding:0.16rem 0.266666rem;
		background-color: #FFFFFF;
		border-radius: 0.64rem;
		i{
			padding-right: 0.16rem;
			color:#666;
			font-size:0.48rem;
		}
		span{
			color:#666;
			font-size:0.373333rem;
		}
	}
	.go-home{
		padding: 0 0.266666rem;
		line-height: 1.173333rem;
		img{
			width: 0.48rem;
			height: 0.48rem;
		}
	}
}
section{
	display: flex;
	flex:1;
	overflow:hidden;
}
.list-l{
	width: 2.48rem;
	background-color: #fff;
	border-right: 1px solid #CCCCCC;
	overflow: hidden;
	.l-item{
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		li{
			width: 100%;
			line-height: 1.333333rem;
			text-align: center;
			font-size:0.373333rem;
			&.active{
				color:#b54f4a;
				border-left:6px solid #b54f4a;
			}
		}
	}
}


.list-r{
	flex:1;
	overflow: hidden;
	.shop-list{
		text-align: center;
		h2{
			padding:0.533333rem 0;
			font-size:0.64rem;
			font-weight: 400;
		}
		.r-content{
			display: flex;
			flex-wrap: wrap;
			li{
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				width: 33.33%;
				padding:0.266666rem 0;
				img{
					width: 1.413333rem;
					height: 1.413333rem;
				}
				span{
					font-size:0.426666rem;
				}
			}
		}
	}
}
::v-deep.tabbar{
	border-top:1px solid #CCCCCC;
}
</style>

