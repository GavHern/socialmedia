<?php

/*

Parameters for this file: value (0 to unsave, 1 to save), post (what post to save/ unsave)

*/



// Requires (header information, database functions, authentication functions, utility functions)
include 'tools/headers.php';
include 'tools/db.php';
include 'tools/auth.php';
include 'tools/utils.php';


// Get all nessisary parameters and sanitize them
$values = array(
    "user" => get_session(),
    "save" => sanitize($_GET["value"]),
    "post" => sanitize($_GET["post"]),
    "timestamp" => time() // Get current timestamp
);

// Checks if user wants to save or unsave
if($values["save"]){
    
    // Checks if the user already saved the post, and throws an error if true
    if(!empty(db("SELECT * FROM `saved` WHERE user = {$values["user"]} AND post = {$values["post"]};", true))){
        throw_error("You've already saved that post.");
    }
    
    // Adds entry to the database
    db("INSERT INTO `saved`(`user`, `post`, `timestamp`) VALUES ({$values["user"]},{$values["post"]},{$values["timestamp"]})", false);
} else {

    // Removes entry from the database
    db("DELETE FROM `saved` WHERE `user`={$values["user"]} AND `post`={$values["post"]}", false);
}



// Echo success
echo json_encode(array(
    "success" => true
));