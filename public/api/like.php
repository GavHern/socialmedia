<?php

/*

Parameters for this file: value (0 to unlike, 1 to like), comment (if its a comment or not), post (what post to like/ unlike)

*/



// Requires (header information, database functions, authentication functions, utility functions)
include 'tools/headers.php';
include 'tools/db.php';
include 'tools/auth.php';
include 'tools/utils.php';


// Get all nessisary parameters and sanitize them
$values = array(
    "user" => get_session(),
    "like" => sanitize($_GET["value"]),
    "is_comment" => sanitize($_GET["comment"]),
    "post" => sanitize($_GET["post"]),
    "timestamp" => time() // Get current timestamp
);

// Checks if user wants to like or unlike
if($values["like"]){
    
    // Checks if the user already saved the post, and throws an error if true
    if(!empty(db("SELECT * FROM `likes` WHERE user = {$values["user"]} AND id = {$values["post"]} AND is_comment = {$values["is_comment"]};", true))){
        throw_error("You've already liked that post.");
    }
    
    // Adds entry to the database
    db("INSERT INTO `likes`(`user`, `id`, `is_comment`, `timestamp`) VALUES ({$values["user"]},{$values["post"]},{$values["is_comment"]},{$values["timestamp"]})", false);
} else {

    // Removes entry from the database
    db("DELETE FROM `likes` WHERE `user`={$values["user"]} AND `id`={$values["post"]} AND `is_comment`={$values["is_comment"]}", false);
}



// Echo success
echo json_encode(array(
    "success" => true
));