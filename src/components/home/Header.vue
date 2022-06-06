<template>
    <div>
        <header class="indexheader indexflont">
      <h1><i class="iconfont icon-zhihuixiaoyuanlogo_huaban"></i></h1>
      <div class="search">
          <div class="center">
              <i class="iconfont icon-fangdajing"></i>
          <span>搜您喜欢的商品</span>
          </div>
      </div>
      <div class="kefu">
          <i class="iconfont icon-kefu"></i>
      </div>
        </header>
    </div>
 
  
</template>

<script>
export default {
    
}
</script>

<style scoped>
@import url('../../assets/css/font.css');

header{
    position: fixed;
    z-index: 999;
    top: 0px;
    width: 100%;
    /* max-width: 640px; */
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
    background-color: #b0352f;
    display: flex;
    justify-content: space-around;
    height: 2.75rem;
    line-height: 2.75rem;
}
h1 i{
    font-size: 1.875rem;
    color: #fff;
}
.search{
    border-radius: 30px;
    width: 17.25rem;
    height: 1.875rem;
    border: 1px solid #fff;
    margin: auto 0;
    background-color: #fff;
}
.search .center{
    line-height: 30px;
}
.search .center i{
    font-size: 20px;
    margin:0 10px;
    color: black;
}
.kefu i{
    font-size: 1.874rem;
    color: #fff;
}
</style>