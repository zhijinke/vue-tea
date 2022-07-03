var express = require('express');
var router = express.Router();
const connection = require('../db/sql')
const user = require('../db/userSql')
var QcloudSms = require("qcloudsms_js");
let jwt = require('jsonwebtoken');
//引入支付宝配置文件
const alipaySdk = require('../db/alipay.js');
const AlipayFormData = require('alipay-sdk/lib/form').default;
//引入axiso
const axios = require('axios');

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index', { title: 'Express' });
});

//支付状态
router.post('/api/successPayment',function(req,res,next){
    //token
    let token = req.headers.token;
    let tokenObj = jwt.decode(token);
    //订单号
    let out_trade_no = req.body.out_trade_no;
    let trade_no = req.body.trade_no;
    //支付宝配置
    const formData = new AlipayFormData();
    // 调用 setMethod 并传入 get，会返回可以跳转到支付页面的 url
    formData.setMethod('get');
    //支付时信息
    formData.addField('bizContent', {
      out_trade_no,
      trade_no
    });
    //返回promise
    const result = alipaySdk.exec(
      'alipay.trade.query',
      {},
      { formData: formData },
    );
    //后端请求支付宝
    result.then(resData=>{
        axios({
            method:'GET',
            url:resData
        }).then(data=>{
            let responseCode = data.data.alipay_trade_query_response;
            if(  responseCode.code == '10000' ){
                switch(  responseCode.trade_status  ){
                    case 'WAIT_BUYER_PAY':
                        res.send({
                            data:{
                                code:0,
                                data:{
                                    msg:'支付宝有交易记录，没付款'
                                }
                            }
                        })
                    break;
                    
                    case 'TRADE_CLOSED':
                        res.send({
                            data:{
                                code:1,
                                data:{
                                    msg:'交易关闭'
                                }
                            }
                        })
                    break;
                    
                    case 'TRADE_FINISHED':
                        connection.query(`select * from user where userTel = ${tokenObj.tel}`,function(error,results){
                            //用户id
                            let uId = results[0].id;
                            connection.query(`select * from store_order where uId = ${uId} and order_id = ${out_trade_no}`,function(err,result){
                                let id = result[0].id;
                                //订单的状态修改掉2==》3
                                connection.query(`update store_order set order_status = replace(order_status,'2','3') where id = ${id}`,function(){
                                    res.send({
                                        data:{
                                            code:2,
                                            data:{
                                                msg:'交易完成'
                                            }
                                        }
                                    })
                                })
                            })
                        })
                    break;
                    
                    case 'TRADE_SUCCESS':
                        connection.query(`select * from user where userTel = ${tokenObj.tel}`,function(error,results){
                            //用户id
                            let uId = results[0].id;
                            connection.query(`select * from store_order where uId = ${uId} and order_id = ${out_trade_no}`,function(err,result){
                                let id = result[0].id;
                                //订单的状态修改掉2==》3
                                connection.query(`update store_order set order_status = replace(order_status,'2','3') where id = ${id}`,function(){
                                    res.send({
                                        data:{
                                            code:2,
                                            data:{
                                                msg:'交易完成'
                                            }
                                        }
                                    })
                                })
                            })
                        })
                    break;
                }
            }else if( responseCode.code == '40004' ){
                res.send({
                    data:{
                        code:4,
                        msg:'交易不存在'
                    }
                })
            }
        }).catch( err=>{
            res.send({
                data:{
                    code:500,
                    msg:'交易失败',
                    err
                }
            })
        })
    })
})

// 发起支付
router.post('/api/payment',function(req,res,next){
    //订单号
    let orderId = req.body.orderId;
    //商品总价
    let price = req.body.price;
    //购买商品的名称
    let name = req.body.name;
	console.log(orderId,price,name)
    //开始对接支付宝API
    const formData = new AlipayFormData();
    // 调用 setMethod 并传入 get，会返回可以跳转到支付页面的 url
    formData.setMethod('get');
    //支付时信息
    formData.addField('bizContent', {
      outTradeNo: orderId,//订单号
      productCode: 'FAST_INSTANT_TRADE_PAY',//写死的
      totalAmount: price,//价格
      subject: name,//商品名称
    });
    //支付成功或者失败跳转的链接
    formData.addField('returnUrl', 'http://localhost:8080/payment');
    //返回promise
    const result = alipaySdk.exec(
      'alipay.trade.page.pay',
      {},
      { formData: formData },
    );
    //对接支付宝成功，支付宝方返回的数据
    result.then(resp=>{
        res.send({
            data:{
                code:200,
                success:true,
                msg:'支付中',
                paymentUrl : resp
            }
        })
    })
})

// 改变订单状态-》待支付，并且删除购物车中的数据
router.post('/api/ChangeOrder',(req,res,next)=>{
		// token
		let token = req.headers.token
		let tokenObj = jwt.decode(token)
		// 拿到前端传递的值
		// 商品的订单号
		let order_id = req.body.order_id
		// 购买的商品订单id
		let shopId = req.body.selectList
		// 查询对应的用户
	connection.query(` select * from user where userTel = ${tokenObj.tel} `, (error, results) => {
		if (error) throw error
		// 用户id
		let uid = results[0].id
		// 查询用户的订单
		connection.query(` select * from store_order where uid = ${uid} and order_id = ${order_id} `,(err,result)=>{
			let id = result[0].id
			// 改变商品的状态
			connection.query(` update store_order set order_status = 2 where id = ${id} `,(e,r)=>{
				// 删除购物车的商品
				shopId.forEach(v=>{
					connection.query(` delete from goods_cart where id = ${v} `,(errors,datas)=>{
						
					})
				})
				res.send({
					data:{
						code:200,
						success:true
					}
				})
			})
		})
	})
})

// 查询订单
router.post('/api/selectOrder',(req,res,next)=>{
	// token
	let token = req.headers.token
	let tokenObj = jwt.decode(token)
	// 前端传来的数据
	let order_id = req.body.order_id
	// 查询对应的用户
	connection.query(` select * from user where userTel = ${tokenObj.tel} `, (error, results) => {
		if (error) throw error
		// 用户id
		let uid = results[0].id
		connection.query(` select * from store_order where order_id = ${order_id} and uid = ${uid} `,(error,results)=>{
			res.send({
				data:{
					code:200,
					success:true,
					data:results
				}
			})
		})
	})
})

// 生成订单
router.post('/api/addOrder',(req,res,next)=>{
	//token
	let token = req.headers.token
	let tokenObj = jwt.decode(token)
	// 拿到前端传递的数据
	let arr = req.body.goods
	// 生成时间戳+6位随机数  （生成订单号）
	// 补零
	function addZero(s){
		return s = s>9 ? s : '0' + s
	} 
	// 返回订单号
	function serOrder_id(){
		let now = new Date()
		let year = now.getFullYear()
		let Month = now.getMonth() + 1
		let day = now.getDate()
		let hours = now.getHours()
		let MInutes = now.getMinutes()
		let seconds = now.getSeconds()
		let order_id = year.toString() + addZero(Month).toString() + addZero(day).toString() + addZero(hours).toString() + addZero(MInutes).toString() + addZero(seconds).toString() + Math.floor(Math.random()*10)+ Math.floor(Math.random()*10)+ Math.floor(Math.random()*10)+ Math.floor(Math.random()*10)+ Math.floor(Math.random()*10)+ Math.floor(Math.random()*10)	
		return order_id
	}
	/*
		1:未支付
		2：待支付
		3：支付成功
		4：支付失败
	 */
	// 订单商品列表总名称
	let goods_name = []
	// 订单商品列表总价格
	let goods_price = 0
	// 订单商品列表总数量
	let goods_num = 0
	// 订单号
	let orderCode = serOrder_id()
	arr.forEach(v => {
		goods_name.push(v.goods_name)
		goods_price += parseInt(v.goods_price * v.goods_num)
		goods_num += parseInt(v.goods_num)
	});
	// 查询对应的用户
	connection.query(` select * from user where userTel = ${tokenObj.tel} `, (error, results) => {
		if (error) throw error
		// 用户id
		let uid = results[0].id
		// 写入数据
		connection.query(` insert into store_order (uid,order_id,goods_name,goods_price,goods_num,order_status) values (${uid},'${orderCode}','${goods_name}','${goods_price}','${goods_num}','1')`,(error,results)=>{
			connection.query(`select * from store_order where uid = ${uid} and order_id = ${orderCode}`,(err,result)=>{
				res.send({
					data:{
						code:200,
						success:true,
						data:result
					}
				})
			})
		})
	})
})

// 删除用户收货地址
router.post('/api/delAddress',(req,res,next)=>{
	// token
	let token = req.headers.token
	let tokenObj = jwt.decode(token)
	// 拿到前端传递的数据
	let {id} = req.body
	// 查询对应的用户
	connection.query(` select * from user where userTel = ${tokenObj.tel} `, (error, results) => {
		if (error) throw error
		// 用户id
		let uid = results[0].id
		// 删除数据库中的收货地址
		connection.query(` delete from address where id = ${id} and uid = ${uid} `,(err,result)=>{
			res.send({
				data:{
					code:200,
					success:true,
					msg:'删除成功'
				}
			})
		})
	})
})

// 修改用户收货地址
router.post('/api/updateAddress',(req,res,next)=>{
	// token
	let token = req.headers.token
	let tokenObj = jwt.decode(token)
	// 拿到前端传递的数据
	let body = req.body.content
	let [id,name, tel, province, city, county, addressDetail, isDefault, areaCode] = [
		body.id,
		body.name,
		body.tel,
		body.province,
		body.city,
		body.county,
		body.addressDetail,
		body.isDefault,
		body.areaCode
	]
	// 查询对应的用户
	connection.query(` select * from user where userTel = ${tokenObj.tel} `, (error, results) => {
		if (error) throw error
		// 用户id
		let uid = results[0].id
		// 查询是否为默认地址，如果是，把之前的都改为0
		if(`${isDefault}` == 1){
		connection.query(` select * from address where uid = ${uid} and isDefault = 1`,(err,result)=>{
			if(result.length>0){
				let addressId = result[0].id
			// 如果有,让1变成0，新添加的变成1
			connection.query(` update address set  isDefault = '0' where id = ${addressId} and uid = ${uid}`,(e,r)=>{
				let updateSql = ` update address set uid = ${uid}, name ='${name}', tel = '${tel}', province = '${province}', city = '${city}', county = '${county}', addressDetail = '${addressDetail}', isDefault = '${isDefault}', areaCode = '${areaCode}' where  id = ${id}`
				connection.query(updateSql,(errors,datas)=>{
					res.send({
						data:{
							code:200,
							success:true,
							msg:'地址修改成功'
						}
					})
				})
			})
			}
			// else{
			// 	// 如果没有，直接添加
			// 	let updateSql = ` update address set uid = ${uid}, name ='${name}', tel = '${tel}', province = '${province}', city = '${city}', county = '${county}', addressDetail = '${addressDetail}', isDefault = '${isDefault}', areaCode = '${areaCode}' where  id = ${id}`
			// 	connection.query(updateSql,(errors,datas)=>{
			// 		res.send({
			// 			data:{
			// 				code:200,
			// 				success:true,
			// 				msg:'地址修改成功'
			// 			}
			// 		})
			// 	})
			// }
		})
		} else{
			// 	// 如果没有，直接添加
				let updateSql = ` update address set uid = ${uid}, name ='${name}', tel = '${tel}', province = '${province}', city = '${city}', county = '${county}', addressDetail = '${addressDetail}', isDefault = '${isDefault}', areaCode = '${areaCode}' where  id = ${id}`
				connection.query(updateSql,(errors,datas)=>{
					res.send({
						data:{
							code:200,
							success:true,
							msg:'地址修改成功'
						}
					})
				})
			}
	})
})

// 查询用户收货地址
router.post('/api/seceltAddress', (req, res, next) => {
	// token
	let token = req.headers.token
	let tokenObj = jwt.decode(token)
	// 查询用户
	connection.query(` select * from user where userTel = ${tokenObj.tel} `, (error, results) => {
		if (error) throw error
		// 用户id
		let uid = results[0].id
		// 查询数据库中用户对应的地址
		connection.query(` select * from  address where uid = ${uid}`, (err, result) => {
			if (err) throw error
			res.send({
				code: 200,
				success: true,
				msg: '操作成功',
				data: result
			})
		})
	})
})

// 新增用户收货地址
router.post('/api/Addaddress', (req, res, next) => {
	// token
	let token = req.headers.token
	let tokenObj = jwt.decode(token)
	// 拿到前端传递的数据
	let body = req.body.content
	let [name, tel, province, city, county, addressDetail, isDefault, areaCode] = [
		body.name,
		body.tel,
		body.province,
		body.city,
		body.county,
		body.addressDetail,
		body.isDefault,
		body.areaCode
	]
	// 查询对应的用户
	connection.query(` select * from user where userTel = ${tokenObj.tel} `, (error, results) => {
		if (error) throw error
		// 用户id
		let uid = results[0].id
		//判断一下要存入的是不是默认地址
		if (isDefault != 1) {
			// 不是，直接写入
			// 把地址写入数据库
			connection.query(` insert into address (uid,name,tel,province,city,county,addressDetail,isDefault,areaCode)
			values ( ${uid},'${name}','${tel}','${province}','${city}','${county}','${addressDetail}','${isDefault}','${areaCode}' ) `, (err, result) => {
				if (err) throw error
				res.send({
					data: {
						code: 200,
						success: true,
						msg: '新增地址成功'
					}
				})
			})
		} else {
			// 是，先把默认地址查询出来，然后都变为0，新添加的变为1
			connection.query(` select * from address where isDefault = ${isDefault} and uid = ${uid}`, (e, r) => {
				if (e) throw error
				if (r.length > 0) {
					// 说明有数据，直接修改添加
					let id = r[0].id
					connection.query(` update address set isDefault = '0' where id = ${id} `, (ee, rr) => {
						// 把地址写入数据库
						connection.query(` insert into address (uid,name,tel,province,city,county,addressDetail,isDefault,areaCode)
					values ( ${uid},'${name}','${tel}','${province}','${city}','${county}','${addressDetail}','${isDefault}','${areaCode}' ) `, (eee, rrr) => {
							if (eee) throw error
							res.send({
								data: {
									code: 200,
									success: true,
									msg: '新增地址成功'
								}
							})
						})
					})
				}else{
					// 没有数据，直接添加就行
					// 把地址写入数据库
					connection.query(` insert into address (uid,name,tel,province,city,county,addressDetail,isDefault,areaCode)
					values ( ${uid},'${name}','${tel}','${province}','${city}','${county}','${addressDetail}','${isDefault}','${areaCode}' ) `, (eee, rrr) => {
							if (eee) throw error
							res.send({
								data: {
									code: 200,
									success: true,
									msg: '新增地址成功'
								}
							})
						})
				}

			})
		}

	})
})

// 增加，减少商品的数量
router.post('/api/changeNum', (req, res, next) => {
	let { newNum, id } = req.body
	// 根据id查询对应的商品
	connection.query(` select * from goods_cart where id = ${id} `, (error, results) => {
		if (error) throw error
		// 旧的商品数量
		// let oldNum = results[0].goods_num
		connection.query(` UPDATE goods_cart set goods_num = ${newNum} where id = ${id} `, (err, result) => {
			if (err) throw error
			res.send({
				data: {
					code: 200,
					success: true
				}
			})
		})
	})
})

// 删除购物车商品
router.post('/api/deleteCart', (req, res, next) => {
	let arrId = req.body.arrId;
	for (let i = 0; i < arrId.length; i++) {
		connection.query(`delete from goods_cart where id = '${arrId[i]}'`, function (error, results) {
			if (error) throw error
			
		})
	}
	res.send({
		data: {
			code: 200,
			success: true,
			msg: '删除成功'
		}
	})
})

// 查询购物车数据
router.post('/api/selectCart', (req, res, next) => {
	// 拿到前端传送的数据
	let token = req.headers.token
	let tokenObj = jwt.decode(token)
	// 查询用户
	connection.query(` select * from user where userTel = ${tokenObj.tel} `, (error, results) => {
		if (error) throw error
		// 用户id
		let uid = results[0].id
		// 查询购物车
		connection.query(` select * from goods_cart where uid = ${uid} `, (err, result) => {
			if (err) throw error
			res.send({
				data: {
					code: 200,
					success: true,
					data: result
				}
			})
		})
	})
})

// 加入购物车
router.post('/api/addCart', (req, res, next) => {
	// 拿到前端传递的数据
	let goodsId = req.body.goodsId
	let token = req.headers.token
	let tokenObj = jwt.decode(token)
	// 查询用户
	connection.query(` select * from user where userTel = ${tokenObj.tel} `, (error, results) => {
		if (error) throw error
		// 用户id
		let uid = results[0].id
		// 查询商品
		connection.query(` select * from goods_list where id = ${goodsId} `, (err, result) => {
			// 保存数据
			let goods_name = result[0].name
			let goods_price = result[0].price
			let goods_imgUrl = result[0].imgUrl
			//用户之前是添加过商品到购物车
			connection.query(`select * from goods_cart where uid=${uid} and goods_id=${goodsId}`, (e, r) => {
				if (r.length > 0) {
					let num = r[0].goods_num;
					connection.query(`update goods_cart set goods_num = replace(goods_num,${num},${parseInt(num) + 1}) where id = ${r[0].id}`, function (es, datas) {
						res.send({
							data: {
								code: 200,
								success: true,
								msg: '添加成功'
							}
						})
					})
				} else {
					// 数据库里没有，添加
					connection.query(` insert into goods_cart (uid,goods_id,goods_name,goods_price,goods_num,goods_imgUrl)
					 values ( '${uid}','${goodsId}','${goods_name}','${goods_price}','1','${goods_imgUrl}' ) `, (e, r) => {
						if (e) throw error
						res.send({
							data: {
								code: 200,
								success: true,
								msg: '购物车添加成功！'
							}
						})
					})
				}
			})
		})
	})
})

// 找回密码，修改密码
router.post('/api/recovery', (req, res, next) => {
	// 拿到前端给的数据
	let params = {
		userTel: req.query.userTel,
		userPwd: req.query.userPwd
	}
	// 查询用户是否存在
	connection.query(user.queryUserTel(params), (error, results) => {
		if (error) throw error
		// 用户不存在
		if (results <= 0) {
			res.send({
				code: 0,
				data: {
					success: false,
					msg: '此用户未注册！'
				}
			})
		} else {
			// 用户存在,根据手机号查找id，然后修改密码
			connection.query(`select id from user where userTel = ${params.userTel}`, (err, results) => {
				if (err) throw error
				let id = results[0].id
				// 根据id修改相应的密码
				connection.query(`UPDATE user SET userPwd = '${params.userPwd}' where id = '${id}'`, (error, result) => {
					if (error) throw error
					res.send({
						code: 200,
						data: {
							success: true,
							msg: '密码修改成功!'
						}
					})
				})
			})
		}
	})
})

// 注册
router.post('/api/register', (req, res, next) => {
	// 拿到前端给的数据
	let params = {
		userTel: req.body.phone,
		userPwd: req.body.pwd
	}
	// 查询用户是否存在
	connection.query(user.queryUserTel(params), (error, result) => {
		if (error) throw error
		// 用户存在
		if (result.length > 0) {
			res.send({
				code: 200,
				data: {
					success: true,
					msg: '登录成功',
					data: result[0]
				}
			})
		} else {
			// 用户不存在，在数据库中添加用户的数据
			connection.query(user.inserData(params), (err, ress) => {
				if (err) throw error
				res.send({
					code: 200,
					data: {
						success: true,
						msg: '登录成功',
						data: ress[0]
					}
				})
			})

		}
	})
})

// 用户登录
router.post('/api/addUser', (req, res, next) => {
	// 拿到前端传递的数据
	let params = {
		userTel: req.body.phone
	}
	// 查询用户是否存在
	connection.query(user.queryUserTel(params), (error, result) => {
		if (error) throw error
		// 用户存在
		if (result.length > 0) {
			res.send({
				code: 200,
				data: {
					success: true,
					msg: '登录成功',
					data: result[0]
				}
			})
		} else {
			// 用户不存在，在数据库中添加用户的数据
			connection.query(user.inserData(params), (err, ress) => {
				if (err) throw error
				res.send({
					code: 200,
					data: {
						success: true,
						msg: '登录成功',
						data: ress[0]
					}
				})
			})

		}
	})
})

// 发送短信验证码
router.post('/api/code', (req, res, next) => {
	let tel = req.body.phone;
	// 短信应用SDK AppID
	var appid = 1400187558;  // SDK AppID是1400开头

	// 短信应用SDK AppKey
	var appkey = "dc9dc3391896235ddc2325685047edc7";

	// 需要发送短信的手机号码
	var phoneNumbers = [tel];

	// 短信模板ID，需要在短信应用中申请
	var templateId = 285590;  // NOTE: 这里的模板ID`7839`只是一个示例，真实的模板ID需要在短信控制台中申请

	// 签名
	var smsSign = "三人行慕课";  // NOTE: 这里的签名只是示例，请使用真实的已申请的签名, 签名参数使用的是`签名内容`，而不是`签名ID`

	// 实例化QcloudSms
	var qcloudsms = QcloudSms(appid, appkey);

	// 设置请求回调处理, 这里只是演示，用户需要自定义相应处理回调
	function callback(err, ress, resData) {
		if (err) {
			console.log("err: ", err);
		} else {
			res.send({
				code: 200,
				data: {
					successL: true,
					data: ress.req.body.params[0]
				}
			})
		}
	}
	// Math.floor( Math.random()*(9999-1000))+1000
	var ssender = qcloudsms.SmsSingleSender();
	var params = [Math.floor( Math.random()*(9999-1000))+1000];
	ssender.sendWithParam(86, phoneNumbers[0], templateId,
		params, smsSign, "", "", callback);  // 签名参数不能为空串
})

// 登录查询手机号密码的接口
router.post('/api/login', function (req, res, next) {
	//后端要接收前端传递过来的值
	let params = {
		userTel: req.body.userTel,
		userPwd: req.body.userPwd
	};

	//查询用户手机号是否存在
	connection.query(user.queryUserTel(params), function (error, results) {
		//手机号存在 
		// console.log(results)
		if (results.length > 0) {
			// console.log([...results])
			connection.query(user.queryUserPwd(params), function (err, result) {
				// console.log(user.queryUserTel(params))
				// console.log(user.queryUserPwd( params ))
				// console.log(result)
				// console.log(err)
				if (result.length > 0) {
					// console.log(RowDataPacket)
					//手机号和密码都对
					res.send({
						code: 200,
						data: {
							success: true,
							msg: '登录成功',
							data: result
						}
					})
				} else {
					//密码不对
					res.send({
						code: 302,
						data: {
							success: false,
							msg: '密码不正确'
						}
					})
				}
			})

		} else {
			//不存在
			res.send({
				code: 301,
				data: {
					success: false,
					msg: '手机号不存在'
				}
			})
		}
	})
})

// 查询商品id数据的接口
router.get('/api/goods/id', (req, res, next) => {
	let id = req.query.id
	connection.query('select * from goods_list where id=' + id + '', (err, result) => {
		res.send({
			code: 0,
			data: result
		})
	})
})

// 分类的数据接口
router.get('/api/goods/list', (req, res, next) => {
	res.send({
		code: 0,
		data: [
			{
				// 一级
				id: 0,
				name: '推荐',
				data: [
					{
						// 二级
						id: 0,
						name: '推荐',
						list: [
							{
								id: 0,
								name: '铁观音',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 1,
								name: '金菊梅',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 2,
								name: '武夷岩茶',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 3,
								name: '龙井',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 4,
								name: '云南滇江',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 5,
								name: '紫砂壶',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 6,
								name: '功夫茶具',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 7,
								name: '家具电器',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 8,
								name: '大红袍',
								imgUrl: 'images/list1.jpeg'
							},
						]
					}
				]
			},
			{
				// 一级
				id: 1,
				name: '绿茶',
				data: [
					{
						// 二级
						id: 0,
						name: '绿茶',
						list: [
							{
								id: 0,
								name: '铁观音',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 1,
								name: '金菊梅',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 2,
								name: '武夷岩茶',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 3,
								name: '龙井',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 4,
								name: '云南滇江',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 5,
								name: '紫砂壶',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 6,
								name: '功夫茶具',
								imgUrl: 'images/list1.jpeg'
							},
						]
					}
				]
			},
			{
				// 一级
				id: 2,
				name: '乌龙',
				data: [
					{
						// 二级
						id: 0,
						name: '乌龙',
						list: [
							{
								id: 0,
								name: '铁观音',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 1,
								name: '金菊梅',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 2,
								name: '武夷岩茶',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 3,
								name: '龙井',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 4,
								name: '云南滇江',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 5,
								name: '紫砂壶',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 6,
								name: '功夫茶具',
								imgUrl: 'images/list1.jpeg'
							},
						]
					}
				]
			},
			{
				// 一级
				id: 3,
				name: '红茶',
				data: [
					{
						// 二级
						id: 0,
						name: '红茶',
						list: [
							{
								id: 0,
								name: '铁观音',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 1,
								name: '金菊梅',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 2,
								name: '武夷岩茶',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 3,
								name: '龙井',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 4,
								name: '云南滇江',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 5,
								name: '紫砂壶',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 6,
								name: '功夫茶具',
								imgUrl: 'images/list1.jpeg'
							},
						]
					}
				]
			},
			{
				// 一级
				id: 4,
				name: '白茶',
				data: [
					{
						// 二级
						id: 0,
						name: '白茶',
						list: [
							{
								id: 0,
								name: '铁观音',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 1,
								name: '金菊梅',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 2,
								name: '武夷岩茶',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 3,
								name: '龙井',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 4,
								name: '云南滇江',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 5,
								name: '紫砂壶',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 6,
								name: '功夫茶具',
								imgUrl: 'images/list1.jpeg'
							},
						]
					}
				]
			},
			{
				// 一级
				id: 5,
				name: '普洱',
				data: [
					{
						// 二级
						id: 0,
						name: '普洱',
						list: [
							{
								id: 0,
								name: '铁观音',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 1,
								name: '金菊梅',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 2,
								name: '武夷岩茶',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 3,
								name: '龙井',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 4,
								name: '云南滇江',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 5,
								name: '紫砂壶',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 6,
								name: '功夫茶具',
								imgUrl: 'images/list1.jpeg'
							},
						]
					}
				]
			},
			{
				// 一级
				id: 6,
				name: '花茶',
				data: [
					{
						// 二级
						id: 0,
						name: '花茶',
						list: [
							{
								id: 0,
								name: '铁观音',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 1,
								name: '金菊梅',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 2,
								name: '武夷岩茶',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 3,
								name: '龙井',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 4,
								name: '云南滇江',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 5,
								name: '紫砂壶',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 6,
								name: '功夫茶具',
								imgUrl: 'images/list1.jpeg'
							},
						]
					}
				]
			},
			{
				// 一级
				id: 7,
				name: '茶具',
				data: [
					{
						// 二级
						id: 0,
						name: '茶具',
						list: [
							{
								id: 0,
								name: '铁观音',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 1,
								name: '金菊梅',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 2,
								name: '武夷岩茶',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 3,
								name: '龙井',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 4,
								name: '云南滇江',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 5,
								name: '紫砂壶',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 6,
								name: '功夫茶具',
								imgUrl: 'images/list1.jpeg'
							},
						]
					}
				]
			},
			{
				// 一级
				id: 8,
				name: '手艺',
				data: [
					{
						// 二级
						id: 0,
						name: '手艺',
						list: [
							{
								id: 0,
								name: '铁观音',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 1,
								name: '金菊梅',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 2,
								name: '武夷岩茶',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 3,
								name: '龙井',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 4,
								name: '云南滇江',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 5,
								name: '紫砂壶',
								imgUrl: 'images/list1.jpeg'
							},
							{
								id: 6,
								name: '功夫茶具',
								imgUrl: 'images/list1.jpeg'
							},
						]
					}
				]
			},
		]
	})
})
// 搜索茶叶的接口
router.get('/api/goods/shopList', (req, res, next) => {
	// 前端给后端的数据
	// console.log(req.query.searchName)
	let [searchName, orderName] = Object.keys(req.query)
	let [name, order] = Object.values(req.query)
	// console.log(searchName,orderName,name,order)
	connection.query('select * from goods_list where name like "%' + name + '%" order by ' + orderName + ' ' + order + ' ', (err, result) => {
		// if(err) return err.message
		// console.log(result)
		res.send({
			code: 0,
			data: result
		})
	})
})
//首页铁观音的数据
router.get('/api/index_list/2/data/1', function (req, res, next) {
	res.send({
		code: 0,
		data: [
			{
				id: 1,
				type: 'adList',
				data: [
					{
						id: 1,
						imgUrl: './images/tgy.jpeg'
					},
					{
						id: 2,
						imgUrl: './images/tgy.jpeg'
					}
				]
			},
			{
				id: 1,
				type: 'iconsList',
				data: [
					{
						id: 1,
						title: '自饮茶',
						imgUrl: './images/icons1.png'
					},
					{
						id: 2,
						title: '茶具',
						imgUrl: './images/icons2.png'
					},
					{
						id: 3,
						title: '茶礼盒',
						imgUrl: './images/icons3.png'
					},
					{
						id: 4,
						title: '领福利',
						imgUrl: './images/icons4.png'
					},
					{
						id: 5,
						title: '官方验证',
						imgUrl: './images/icons5.png'
					}
				]
			},
			{
				id: 3,
				type: 'likeList',
				data: [
					{
						id: 1,
						imgUrl: './images/like.jpeg',
						name: '建盏茶具套装 红色芝麻毫 12件套',
						price: 299
					},
					{
						id: 2,
						imgUrl: './images/like.jpeg',
						name: '建盏茶具套装 红色芝麻毫 12件套',
						price: 299
					},
					{
						id: 3,
						imgUrl: './images/like.jpeg',
						name: '建盏茶具套装 红色芝麻毫 12件套',
						price: 299
					}
				]
			}

		]
	})
})
//首页大红袍的数据
router.get('/api/index_list/1/data/1', function (req, res, next) {
	res.send({
		code: 0,
		data: [
			{
				id: 1,
				type: 'adList',
				data: [
					{
						id: 1,
						imgUrl: './images/dhp.jpeg'
					},
					{
						id: 2,
						imgUrl: './images/dhp.jpeg'
					}
				]
			},
			{
				id: 2,
				type: 'likeList',
				data: [
					{
						id: 1,
						imgUrl: './images/like.jpeg',
						name: '建盏茶具套装 红色芝麻毫 12件套',
						price: 299
					},
					{
						id: 2,
						imgUrl: './images/like.jpeg',
						name: '建盏茶具套装 红色芝麻毫 12件套',
						price: 299
					},
					{
						id: 3,
						imgUrl: './images/like.jpeg',
						name: '建盏茶具套装 红色芝麻毫 12件套',
						price: 299
					}
				]
			}

		]
	})
})
//首页推荐的数据
router.get('/api/index_list/0/data/1', function (req, res, next) {
	res.send({
		code: 0,
		data: {
			topBar: [
				{ id: 0, label: '推荐' },
				{ id: 1, label: '大红袍' },
				{ id: 2, label: '铁观音' },
				{ id: 3, label: '绿茶' },
				{ id: 4, label: '普洱' },
				{ id: 5, label: '茶具' },
				{ id: 6, label: '花茶' },
			],
			data: [
				//这是swiper
				{
					id: 0,
					type: 'swiperList',
					data: [
						{ id: 0, imgUrl: './images/swiper1.jpeg' },
						{ id: 1, imgUrl: './images/swiper2.jpeg' },
						{ id: 3, imgUrl: './images/swiper3.jpeg' }
					]
				},
				//这是icons
				{
					id: 1,
					type: 'iconsList',
					data: [
						{
							id: 1,
							title: '自饮茶',
							imgUrl: './images/icons1.png'
						},
						{
							id: 2,
							title: '茶具',
							imgUrl: './images/icons2.png'
						},
						{
							id: 3,
							title: '茶礼盒',
							imgUrl: './images/icons3.png'
						},
						{
							id: 4,
							title: '领福利',
							imgUrl: './images/icons4.png'
						},
						{
							id: 5,
							title: '官方验证',
							imgUrl: './images/icons5.png'
						}
					]
				},
				//爆款推荐
				{
					id: 3,
					type: 'recommendList',
					data: [
						{
							id: 1,
							name: '龙井1號铁罐250g',
							content: '鲜爽甘醇 口粮首选',
							price: '68',
							imgUrl: './images/recommend.jpeg'
						},
						{
							id: 2,
							name: '龙井1號铁罐250g',
							content: '鲜爽甘醇 口粮首选',
							price: '68',
							imgUrl: './images/recommend.jpeg'
						}
					]
				},
				//猜你喜欢
				{
					id: 4,
					type: 'likeList',
					data: [
						{
							id: 1,
							imgUrl: './images/goods1.jpg',
							name: '长白山红茶',
							price: 199
						},
						{
							id: 2,
							imgUrl: './images/goods2.jpg',
							name: '昆仑山红茶',
							price: 299
						},
						{
							id: 3,
							imgUrl: './images/goods3.jpg',
							name: '龙井绿茶',
							price: 399
						},
						{
							id: 4,
							imgUrl: './images/goods4.jpg',
							name: '铁观音绿茶',
							price: 499
						}
					]
				}

			]
		}
	})
});

module.exports = router;
