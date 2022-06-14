const express = require("express");
const auth_route = express.Router();
const conn=require("../modals/connection");
var bcrypt = require('bcryptjs');

//log user to the chatty code
auth_route.post('/join_room',async (req,res)=>{
    const {chatty_code} = req.body;
    if(!chatty_code){
        res.json({code: "0",message:"All form field are needed!"}); 
        res.end();
    }
    else{
        //check if user exist
        conn.query(`SELECT * FROM chatty_members 
        LEFT JOIN chatty_rooms ON chatty_rooms.room_code=chatty_members.room_id 
        LEFT JOIN members ON members.member_id=chatty_members.member_id
        WHERE chatty_members.chatty_code='${chatty_code}' LIMIT 1`,(mem_err,mem_reslt)=>{
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
                        res.json({code: 1,message:"Succesfuly logged in",room_code:`${mem_reslt[0].room_code}`});
                        res.end();
                    }
                    else{
                        res.cookie('chatty_code',reslt[0].room_code);
                        res.cookie('user_id',reslt[0].member_id);
                        res.cookie('user_name',reslt[0].name);
                        res.json({code: 1,message:"Succesfuly logged in",room_code:`${mem_reslt[0].room_code}`});
                        res.end();
                    }
                });
            }
            else{
                res.json({code: "0",message:"Could not find the chatty room match the code!"}); 
                res.end();
            }
        });
    }
});

//handle login request
auth_route.post('/create_room',async (req,res)=>{
    const {room_name,chatty_name} = req.body;
    let chatty_code=generateRandomNumber();
    if(!room_name || !chatty_name){
        res.json({code: "0",message:"All form field are needed!"}); 
        res.end();
    }
    else{
        //insert user to the member table
        conn.query(`INSERT INTO members SET ? `,{name:chatty_name,member_code:chatty_code,status:'1',date_created:new Date().toISOString().slice(0, 20)},function (error, results) {
            if(error) throw error;
            if(results.affectedRows){
                //get user id
                let member_id=results.insertId;
                //generate room code  
                let room_code=generateRandomNumber();
                //insert new room parallel with new user
                conn.query(`INSERT INTO chatty_rooms SET ? `,
                {owner_id:member_id, room_coverpic:'/static/images/default.png', room_code:room_code, room_name:room_name, room_type:"flush", date_created:new Date().toISOString().slice(0, 20)},
                (eror, reslts)=>{
                    if(eror) throw eror;
                    if(reslts.affectedRows){
                        //save room id
                        let room_id=results.insertId;
                        //asign user to the chatty member as the owner
                        conn.query("INSERT INTO chatty_members SET ?",
                        {member_id:member_id, room_id:room_code, chatty_code:room_code, type:'admin', date_created:new Date().toISOString().slice(0, 20)},
                        (er1,rs1)=>{
                            if(er1) throw er1;
                            if(rs1.affectedRows){
                                res.cookie('chatty_code',room_code);
                                res.cookie('user_id',member_id);
                                res.cookie('user_name',chatty_name);
                                res.json({code: 1,message:"Succesfuly logged in",room_code:`${room_code}`});
                                res.end();
                            }
                            else{
                                res.json({code: "0",message:"Something went wrong, please try again later! 2"}); 
                                res.end();
                            }
                        });
                    }
                    else{
                        res.json({code: "0",message:"Something went wrong, please try again later!"}); 
                        res.end();
                    }
                });
            }
            else{
                res.json({code: "0",message:"Something went wrong, please try again later!"}); 
                res.end();
            }
        });
    }
});

function generateRandomNumber() {
    var minm = 100000;
    var maxm = 999999;
    return Math.floor(Math .random() * (maxm - minm + 1)) + minm;
}

module.exports=auth_route;