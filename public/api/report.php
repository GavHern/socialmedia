<?php

/*

Parameters for this file: id (post or comment id), comment (if the item being reported is a comment), reason, message

*/

// Requires (header information, database functions, authentication functions, utility functions)
include 'tools/headers.php';
include 'tools/db.php';
include 'tools/auth.php';
include 'tools/utils.php';


// Get all nessisary parameters and sanitize them
$values = array(
    "user" => get_session(),
    "id" => sanitize($_GET["id"]),
    "is_comment" => sanitize($_GET["comment"]),
    "reason" => sanitize($_GET["reason"]),
    "message" => sanitize($_GET["message"]),
    "timestamp" => time() // Get current timestamp
);

if(empty($values['reason'])){
    throw_error("Your report must contain a reason");
}

$last_report = db("SELECT `timestamp` FROM `report` WHERE user={$values['user']} ORDER BY `timestamp` DESC", true)[0]['timestamp'];

if($last_report > $values['timestamp'] - 60){
    throw_error("You're doing that too fast.");
}

db("INSERT INTO `report`(`user`, `id`, `is_comment`, `reason`, `message`, `timestamp`) VALUES ({$values['user']},{$values['id']},{$values['is_comment']},'{$values['reason']}','{$values['message']}',{$values['timestamp']})", false);

// Echo success
echo json_encode(array(
    "success" => true
));