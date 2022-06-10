const mysql = require('mysql')
let connection = mysql.createConnection({
    host:'localhost', // 数据库地址
    user:'root', // 数据库用户、
    password:'admin123', // 数据库密码
    database:'vue_store' // 需要链接的数据库
})

module.exports  = connection