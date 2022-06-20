const mysql = require('mysql');
var connection = mysql.createConnection({host:'localhost',user:'root',password:'',database:'chatty_code'});
//var connection = mysql.createConnection({host:'localhost',user:'root',password:'#Moshi@1993@',database:'chatty_code'});
connection.connect();
module.exports=connection;