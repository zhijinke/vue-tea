<template>
	<ul class="icons">
		<li v-for='(item,index) in icons' :key='index'>
			<img :src="item.imgUrl" alt="">
			<span>{{item.title}}</span>
		</li>
	</ul>
</template>


<script>
export default{
	props:{icons:Array},
}
</script>

<style scoped>
.icons{
	display: flex;
	justify-content: space-around;
	padding:1rem 0;
}
.icons li{
	display: flex;
	flex-direction: column;
	align-items: center;
}
.icons img{
	width: 1.5rem;
	height: 1.5rem;
}
.icons span{
	padding:.3rem 0;
	font-size:0.426666rem;
}
</style>

