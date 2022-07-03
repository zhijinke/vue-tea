<template>
    <header>
        <i class='iconfont icon-fanhui' @click="goPrev"></i>
        <slot>
            <span>我的地址</span>
        </slot>
        <i class='iconfont icon-kefu'></i>
    </header>
</template>

<script>

export default{
    created(){
        // console.log(this.pathStatus)
    },
    props:['pathStatus'],
    methods:{
        goPrev(){
            if(this.pathStatus){
                this.$router.back()
            }
            if(this.$route.path == '/path'){
                this.$router.push('/my')
            }else{
                this.$router.push('/path')
            }
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
</style>

