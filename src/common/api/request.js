import axios from 'axios'
import { Indicator } from 'mint-ui';
export default{
    common:{
        method:'GET',
        data:{},
        params:{}
    },
    $axios(options={}){
        options.method = options.method || this.common.method
        options.data = options.data || this.common.data
        options.params = options.params || this.common.params

        // 请求前，显示加载中   用请求拦截器也可以
        Indicator.open('加载中...');

        return axios(options).then(v=>{
            let data = v.data.data;
            return new Promise((res,rej)=>{
                if(!v) return rej();
                // 结束 关闭加载中
                setTimeout(()=>{
                    Indicator.close()
                },500)
                res(data)
            })
        })
    }
}