const express = require("express");
const get_route = express.Router();
const conn=require("../modals/connection");
var mysql = require('sync-mysql');
var sync_sql = new mysql({host:'localhost',user:'root',password:'',database:'chatty_code'});

//authed check
const isAuth=(req,res,next)=>{
    //check if there is any cookies established
    if(typeof req.cookies !== 'undefined'){
        //run the database check and log user in if success or redirect incase of fuiler
        if(typeof req.cookies.chatty_code !== "undefined"){next();}
        //if cookies is not set then redirect user to the login page
        else{res.redirect("/");}
    }
    else{res.redirect("/");}
}

//login check
const isLogedIn=(req,res,next)=>{
    if(typeof req.cookies !== 'undefined'){
        //if user is already loged in then redirect them to the dashboard page
        if(req.cookies.chatty_code){res.redirect(`/chatty/${req.cookies.chatty_code}`);}
        //if not then let them access the login page
        else{next();}
    }
    else{res.redirect("/");}
}

//handle user when comes to the home page
get_route.get("/",isLogedIn,(req,res)=>{res.render("index",{title:"Log In"});});

//handle dashboard accessor
get_route.get("/",isAuth,(req,res)=>{ res.render("index",{page_title:"Chatty Code | Log In"});});

//view user profile
get_route.get("/chatty/:room_code",isAuth,(req,res)=>{
    //get chatty details from database
    conn.query(`
    SELECT * FROM chatty_rooms 
    LEFT JOIN chatty_members ON chatty_rooms.room_id=chatty_members.room_id 
    LEFT JOIN members ON members.member_id=chatty_members.member_id
    WHERE chatty_rooms.room_code='${req.params.room_code}'`,(room_err,room_res)=>{
        if(room_err) throw room_err;
        if(room_res.length){
            let room_code=room_res[0].room_code,room_name=room_res[0].room_name,member_list="";
            let msgs="";
            let messages=sync_sql.query(`SELECT * FROM messages LEFT JOIN members ON members.member_id=messages.sender_id WHERE messages.room_code='${req.params.room_code}'`);
            if(messages.length){
                for(let i=0; i<messages.length; i++){
                    let msg=`<li>
                                <div class="message-data">
                                    <span class="message-data-time" >10:14 AM, Today</span> &nbsp; &nbsp;
                                    <span class="message-data-name" >${messages[i].name}</span> <i class="fa fa-circle me"></i>
                                </div>
                                <div class="message other-message">${messages[i].message}</div>
                            </li>`;

                    if(messages[i].sender_id==req.cookies.user_id){
                        msg=`<li class="clearfix">
                                <div class="message-data align-right">
                                    <span class="message-data-name"><i class="fa fa-circle online"></i></span>
                                    <span class="message-data-time">10:20 AM, Today</span>
                                </div>
                                <div class="message my-message  float-right">${messages[i].message}</div>
                            </li>`;
                    }

                    msgs+=msg;
                }
            }

            //get room user list 
            conn.query(`SELECT * FROM chatty_members 
            LEFT JOIN members ON members.member_id=chatty_members.member_id
            WHERE chatty_members.room_id='${req.params.room_code}'`,
            (u_err,u_res)=>{
                if(u_err) throw u_err;
                if(u_res.length){
                    for(let i=0;i<u_res.length; i++){

                        let list=`<li class="clearfix members" id='uid_${u_res[i].member_id}'> <img src="/static/images/default.jpg" style='width:50px;height:50px;' alt="avatar" />
                                    <div class="about"> <div class="name">${u_res[i].name}</div> <div class="status"></div></div>
                                </li>`;

                        if(req.cookies.user_id==u_res[i].member_id){ list=""; }
                        
                        member_list+=list;
                    }

                    res.render("chatty_room", {chattycode:room_code,room_name:room_name,user_id:req.cookies.user_id,user_name:req.cookies.user_name,member_list:member_list,messages:msgs});
                }
                else{
                    res.render("chatty_room", {chattycode:room_code,room_name:room_name,user_id:req.cookies.user_id,user_name:req.cookies.user_name,member_list:member_list,messages:msgs});
                }
            });
        }
        else{
            res.redirect("/");
        }
    });
});

//add new member
get_route.get("/chatty",isAuth,(req,res)=>{res.render("chatty_room",{page_title:"Chatty Code" });});

//chatty code 
get_route.get("/code/:secret",(req,res)=>{
    let chattycode=req.params.secret;
    //check if user exist
    conn.query(`SELECT * FROM chatty_members 
    LEFT JOIN chatty_rooms ON chatty_rooms.room_code=chatty_members.room_id 
    LEFT JOIN members ON members.member_id=chatty_members.member_id
    WHERE chatty_members.chatty_code='${chattycode}' LIMIT 1`,(mem_err,mem_reslt)=>{
        if (mem_err) throw mem_err;
        if(mem_reslt.length){
            //update member status in the chatty member table
            conn.query(`UPDATE members SET status='1' WHERE member_id='${mem_reslt[0].member_id}'`,
            (st_err,st_res)=>{
                if(st_err) throw st_err;
                if(st_res.affectedRows){
                    
                    res.cookie('chatty_code',mem_reslt[0].room_code);
                    res.cookie('user_id',mem_reslt[0].member_id);
                    res.cookie('user_name',mem_reslt[0].name);

                    //redirect user to the chatty room
                    res.redirect(`/chatty/${mem_reslt[0].room_code}`);
                    res.end();
                }
                else{
                    res.cookie('chatty_code',reslt[0].room_code);
                    res.cookie('user_id',reslt[0].member_id);
                    res.cookie('user_name',reslt[0].name);
                    
                    //redirect user to the chatty room
                    res.redirect(`/chatty/${mem_reslt[0].room_code}`);
                    res.end();
                }
            });
        }
        else{
            res.json({code: "0",message:"Could not find the chatty room match the code!"}); 
            res.end();
        }
    });
});

//logout
get_route.get("/logout",isAuth,(req,res)=>{
    res.clearCookie("chatty_code");
    res.render("index",{title:"Log In"}); res.end();
});

module.exports= get_route;