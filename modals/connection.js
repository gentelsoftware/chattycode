const mysql = require('mysql');
var connection = mysql.createConnection({host:'localhost',user:'root',password:'',database:'chatty_code'});
connection.connect();
//host:'localhost',user:'root',password:'#H-hodariHub',database:'hodarihub'
module.exports=connection;