var socket=io.connect("http://localhost:5000/");
let chatty_code=$("#chatty_code").val();
let username=$("#user_name").val();
let userid=$("#user_id").val();
let keyboard_timer;

/* OUTBOND SERVICES */
//join the room
socket.emit("join_room",{uname:username,room:chatty_code,uid:userid,message:"welcome to the chatty code!"});

//send message for type
$("#message-to-send").keydown(function(){
    socket.emit("isTyping",{uname:username,room:chatty_code,status:1,uid:userid});
});  

//on user stop type
$("#message-to-send").keyup(function(){
    // clear the time whenever user engage with the keyboard
    clearTimeout(keyboard_timer);
    // Wait for 2 seconds if user is not engage with the keybord function within the body will be excuted
    keyboard_timer = setTimeout(() => { socket.emit("isTyping",{uname:username,room:chatty_code,status:0,uid:userid}); }, 2000);
});

//send message
$("#send_message").click(function(){
    let message=$("#message-to-send").val();
    $("#message-to-send").val("");
    if(message==""){return;}
    socket.emit("isTyping",{uname:username,room:chatty_code,status:0,uid:userid});
    socket.emit("send_message",{uname:username,room:chatty_code,message:message,uid:userid});
});
/* END */

/////INBOND SERVICES/////
//notify on user join the room
socket.on("userjoin_room", function(data){newMember(data)});

//handle new message
socket.on("message",function(data){
    let msg=messageTemplate(data);
    $("#chatty_list").append(msg);
    $("#chat-history").animate({ scrollTop: $("#chatty_list").height() }, 500);
});

//is a member typing
socket.on("isTyping",function(data){ typeNote(data); });

socket.on("invite_sent",function(data){
    Materialize.toast(`${data.name} is successfully invited with this code ${data.code}`, 4000)
});
/////END/////

/* TEMPLATES */
function messageTemplate(data){
    if(data.uid==userid){
        return `<li class="clearfix">
                    <div class="message-data align-right">
                        <span class="message-data-name"><i class="fa fa-circle online"></i></span>
                        <span class="message-data-time">10:20 AM, Today</span>
                    </div>
                    <div class="message my-message  float-right">${data.message}</div>
                </li>`;
    }
    else{
        return `<li>
                    <div class="message-data">
                        <span class="message-data-time" >10:14 AM, Today</span> &nbsp; &nbsp;
                        <span class="message-data-name" >${data.uname}</span> <i class="fa fa-circle me"></i>
                    </div>
                    <div class="message other-message">${data.message}</div>
                </li>`;
    }
}

function typeNote(data){
    if(data.status){
        if(!$("#chatty_list").find(`#user_${data.uid}`).length){
            $("#chatty_list").append( `<li id='user_${data.uid}'><em>${data.uname} is typing..</em></li>`);
        }
    }
    else{$("#chatty_list").find(`#user_${data.uid}`).remove();}
}

function newMember(data){
    if(!$("#chatty_member").find(`#uid_${data.uid}`).length){
        $("#chatty_member").append(`<li class="clearfix members" id='uid_${data.uid}'>
                                    <img src="/static/images/default.jpg" width='40px' height='40px' alt="avatar" />
                                    <div class="about">
                                        <div class="name">${data.uname}</div>
                                    </div>
                                </li>`);
    } 
}
/* END */

$("#send_code").click(function(){
    let newuser=$("#invite_user").val();
    let user_number=$("#user_number").val();
    socket.emit("inviteUser",{uname:username,room:chatty_code,newuser:newuser,user_number:user_number});
});
$("#chat-history").dblclick(function(){$("#invite_member").fadeIn();});

$(document).mouseup(function(e) {
    if($(".tools").is(":visible")){
        var container =  $(".tools");
        if(!container.is(e.target) && container.has(e.target).length === 0) { container.fadeOut();}
    }
});

$("#search_member").on("keyup", function() {
    var value = $(this).val().toLowerCase();
    $("#chatty_member").find(".members").filter(function() {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
});