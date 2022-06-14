$(".room_toggler").click(function(){
    let idopen=$(this).data("idopen");
    $(".form").slideUp();
    $(`#${idopen}`).slideDown();
});

$("form#newroomform").submit(function(e){
    e.preventDefault();$('form#newroomform').find(".response").fadeIn();
    $(this).find(".response").html(`<em style='color:green;'>Progress response..</em>`); 
    var formData = $(this);
    $.ajax({
        type:"POST",url:"/create_room", data:formData.serialize(),
        success:function(rs){
            if(rs.code==1){
                $("form#newroomform").find(".response").html(`<em style='color:green;'>Success Logged In wait..</em>`);
                setTimeout(()=>{$('form#newroomform').find(".response").fadeOut();},5000);
                window.location=`/chatty/${rs.room_code}`;
            }
            else{
                $('form#newroomform').find(".response").html(`<em style='color:red'>${rs.message}</em>`);
                setTimeout(()=>{$('form#newroomform').find(".response").fadeOut();},5000);
            }
        }
    });
});

$("form#loginform").submit(function(e){
    e.preventDefault();$('form#loginform').find(".response").fadeIn();
    $(this).find(".response").html(`<em style='color:green;'>Progress response..</em>`); 
    var formData = $(this);
    $.ajax({
        type:"POST",url:"/join_room", data:formData.serialize(),
        success:function(rs){
            if(rs.code==1){
                $("form#loginform").find(".response").html(`<em style='color:green;'>Success Logged In wait..</em>`);
                setTimeout(()=>{$('form#loginform').find(".response").fadeOut();},5000);
                window.location=`/chatty/${rs.room_code}`;
            }
            else{
                $('form#loginform').find(".response").html(`<em style='color:red'>${rs.message}</em>`);
                setTimeout(()=>{$('form#loginform').find(".response").fadeOut();},5000);
            }
        }
    });
});