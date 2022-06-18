const express= require("express");
const app= express();
const path = require("path");
const socket= require("socket.io");
const get_route=require("./routes/get_route");
const auth_route=require("./routes/auth_route");
const dbtables=require("./controllers/create_tables");
const cookieParser = require('cookie-parser');
const conn=require("./modals/connection");
const sms=require("./modals/beem_sms_api");

//establish express ejs
app.set("view engine","ejs");

//listern to the end point
const server=app.listen(5000);

//create tables in  the database connected
dbtables.create_tables();

//passcookies to the browser
app.use(cookieParser());

//set static file to be public
app.use("/static",express.static(path.join(__dirname,'public')));

//handle incoming form post
app.use(express.urlencoded({extended: true}));

//registraion route
app.use(auth_route);

//All core route
app.use(get_route);

const  io=socket(server);
io.on("connection",(socket)=>{
    socket.on("join_room",(data)=>{
        socket.join(data.room)
        socket.on("isTyping",data=>{ socket.broadcast.to(data.room).emit("isTyping",data); });

        socket.on("inviteUser",data=>{
            let chatty_code=generateRandomNumber();
            //insert user into the member table
            conn.query(`INSERT INTO members SET ? `,{name:data.newuser,member_code:chatty_code,status:'0',date_created:new Date().toISOString().slice(0, 20)},(mem_err,mem_res)=>{
                if(mem_err) throw mem_err;
                if(mem_res.affectedRows){
                    let member_id=mem_res.insertId;
                    let room_chatty_code=generateRandomNumber();
                    //insert user into the chatty member table
                    conn.query(`INSERT INTO chatty_members SET ? `,
                    {member_id:member_id,room_id:data.room,chatty_code:room_chatty_code,type:'member',date_created:new Date().toISOString().slice(0,20)},
                    (err,res)=>{
                        if(err) throw err;
                        if(res.affectedRows){
                            sms.send(room_chatty_code,data.user_number);
                            io.to(data.room).emit("invite_sent",{code:room_chatty_code,name:data.newuser});
                        }
                        else{ io.to(data.room).emit("invite_sent",{code:0,name:data.newuser}); }
                    });
                }
                else{
                    io.to(data.room).emit("invite_sent",{code:0,name:data.newuser}); 
                }
            });
        })

        socket.on("send_message",data=>{
            //save message to the database
            conn.query(`INSERT INTO messages SET ?`,
            {room_code:data.room,sender_id:data.uid,message:data.message,date_created:new Date().toISOString().slice(0,20)},
            (err,res)=>{
                if(err) throw err;
                if(res.affectedRows){ io.to(data.room).emit("message",data); }
                else{ io.to(data.room).emit("message",data); }
            });
        });

        socket.broadcast.to(data.room).emit("userjoin_room",data);
    });
});

io.on("disconnect",()=>{console.log("user disconnect");});

function generateRandomNumber() {
    var minm = 100000;
    var maxm = 999999;
    return Math.floor(Math .random() * (maxm - minm + 1)) + minm;
}

//return 404 page incase of page not found
app.use((req, res)=>{res.status(404).sendFile("./views/404.html",{root: __dirname});});