<?php

/*

Parameters for this file: value (0 to unfollow, 1 to follow), account (who to follow/ unfollow)

*/



// Requires (header information, database functions, authentication functions, utility functions)
include 'tools/headers.php';
include 'tools/db.php';
include 'tools/auth.php';
include 'tools/utils.php';



// Get all nessisary parameters and sanitize them
$values = array(
    "user" => get_session(),
    "follow" => sanitize($_GET["value"]),
    "account" => sanitize($_GET["account"]),
    "timestamp" => time() // Get current timestamp
);

// Prevent user from following themself
if($values['user'] == $values['account'] and $values['follow'] == 1){
    throw_error("You cannot follow yourself");
}


// Checks if user wants to follow or unfollow
if($values["follow"]){
    
    // Checks if the user is already following the account requested, and throws error if true
    if(!empty(db("SELECT * FROM `follows` WHERE user = {$values["user"]} AND follow = {$values["account"]};", true))){
        throw_error("You're already following that user.");
    }
    
    // Adds entry to the database
    db("INSERT INTO `follows`(`user`, `follow`, `timestamp`) VALUES ({$values["user"]},{$values["account"]},{$values["timestamp"]})", false);
} else {

    // Removes entry from the database
    db("DELETE FROM `follows` WHERE `user`={$values["user"]} AND `follow`={$values["account"]}", false);
}



// Echo success
echo json_encode(array(
    "success" => true
));