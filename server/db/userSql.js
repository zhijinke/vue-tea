const User = {
    
    // 查询用户手机号
    queryUserTel( option ){
        return `select * from user where userTel = ${option.userTel}`
    },
    // 查询用户手机号对应的密码
    queryUserPwd( option ){
        return `select * from user where (userTel = ${option.userTel}) and (userPwd = '${option.userPwd}')`
    },
    // 新增一个用户
    inserData( option ){
        let userTel = option.userTel
        let userPwd = option.userPwd || '666666'
        // 引入 token 包
        let jwt = require('jsonwebtoken')
        // 用户信息
        let payLoad = {tel:userTel}
        // 口令
        let command = 'zhijinke'
        // 生成token
        let token = jwt.sign(payLoad,command)
        return ` insert into user (userTel,userPwd,imgUrl,nickName,token) values (${userTel},${userPwd},'images/user.jpeg','${userTel}','${token}')`
        // return ` insert into user (userTel,userPwd) values (${userTel},${userPwd})`

    }
}

exports = module.exports = User;