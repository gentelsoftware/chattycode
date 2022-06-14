const conn=require("../modals/connection");
var create_tables=()=>{

    //Here we save all member details in the database
    conn.query(`CREATE TABLE IF NOT EXISTS chatty_rooms(
                room_id INT(11) NOT NULL AUTO_INCREMENT,
                owner_id INT(11) NOT NULL,
                room_coverpic TEXT NULL, 
                room_code VARCHAR(255) NOT NULL,
                room_name TEXT NOT NULL,
                room_type ENUM('flush','moderate','lastlong') NOT NULL,
                date_created DATETIME NOT NULL,
                PRIMARY KEY(room_id)
            )`, 
        function (error, result) {if (error) throw error;});
    
    //Member
    conn.query(`CREATE TABLE IF NOT EXISTS members(
            member_id INTEGER PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(255) NOT NULL,
            member_code VARCHAR(255) NOT NULL,
            status ENUM('0','1') NOT NULL,
            date_created DATETIME NOT NULL
        )`,
        function (error, result) {if (error) throw error;});
    
    //This save the position of each member in hub
    conn.query(`CREATE TABLE IF NOT EXISTS messages(
                    message_id INTEGER PRIMARY KEY AUTO_INCREMENT,
                    room_id INT(11) NOT NULL,
                    sender_id INT(11) NOT NULL,
                    message TEXT NOT NULL,
                    date_created DATETIME NOT NULL
                )`,
            function (error, result) {if (error) throw error;});


    conn.query(`CREATE TABLE IF NOT EXISTS chatty_members(
                    cm_id INTEGER PRIMARY KEY AUTO_INCREMENT,
                    member_id INT(11) NOT NULL,
                    room_id INT(11) NOT NULL,
                    chatty_code INT(11) NOT NULL,
                    type ENUM('member','admin') NOT NULL,
                    date_created DATETIME NOT NULL
                )`,
            function (error, result) {if (error) throw error;});
}

module.exports={create_tables};