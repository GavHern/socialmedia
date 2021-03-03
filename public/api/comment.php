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
    "timestamp" => time() // Get current timestamp
);


// Check for mentions
$values['body'] = stringToMentions($values['body']);



// Adds comment to database
db("INSERT INTO `comments`(`parent`,`author`,`body`,`edited`,`timestamp`) VALUES ({$values["parent"]}, {$values["user"]}, '{$values["body"]}', 0, {$values["timestamp"]})", false);



// Echo success
echo json_encode(array(
    "success" => true
));