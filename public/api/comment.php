<?php

/*

Parameters for this file: parent (id of parent post), body

*/



// Requires (header information, database functions, authentication functions, utility functions)
include 'tools/headers.php';
include 'tools/db.php';
include 'tools/auth.php';
include 'tools/utils.php';



// Get all nessisary parameters and sanitize them
$values = array(
    "user" => get_session(),
    "parent" => sanitize($_GET["parent"]),
    "body" => sanitize($_GET["body"]),
    "rate_limit" => 15,
    "timestamp" => time() // Get current timestamp
);


// Append thread parameter if defined
if(isset($_GET['thread'])){
    $thread_sanitized = santitize($_GET['thread']);

    $thread_exists = db("SELECT COUNT(*) AS `exists` FROM comments WHERE id = {$thread_sanitized} AND parent = {$values['parent']} AND thread = 0", true)[0]['exists'] > 0;
    
    if(!$thread_exists) throw_error("That thread doesn't exist");
    
    $values['thread'] = $thread_sanitized;
} else {
    $values['thread'] = 0;
}


// Get the timestap of the user's previous comment
$previous_comment_timestamp = db("SELECT `timestamp` FROM `comments` WHERE `author` = {$values['user']} ORDER BY `timestamp` DESC;", true)[0]['timestamp'];

// Check if it was within the past 5 minutes (300 seconds), and rate limit if necessary
if($values['timestamp'] - $previous_comment_timestamp < $values['rate_limit']){
    throw_error("You're doing that too much. Try again later.");
}


// Check for mentions
$values['body'] = stringToMentions($values['body']);



// Adds comment to database
db("INSERT INTO `comments`(`parent`,`author`,`body`,`thread`,`edited`,`timestamp`) VALUES ({$values["parent"]}, {$values["user"]}, '{$values["body"]}', {$values['thread']}, 0, {$values["timestamp"]})", false);



// Echo success
echo json_encode(array(
    "success" => true
));