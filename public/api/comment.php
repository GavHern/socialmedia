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
function parseMentionsToId($matches){ // Function that parses @username into <@id>
    $mention_username = explode('@',$matches[0])[1];
    $mention_id = db("SELECT id FROM `users` WHERE LOWER(username) = LOWER('{$mention_username}');", true)[0]['id'];
    
    // If no user matches the username, don't mention anyone
    if(!isset($mention_id)){
        return $matches[0];
    }
    
    $id_tag = "<@{$mention_id}>";
    
    if(substr($matches[0],0,1) == " "){ // Append leading space if matched
        $id_tag = ' '.$id_tag;
    }
    
    return $id_tag;
}

$pattern = '/(^|[ ])([@][a-zA-Z0-9]{3,})/'; // Regex match pattern for mentions

$values['body'] = preg_replace_callback($pattern, 'parseMentionsToId', $values['body']); // Replace mention with new syntax containing user id



// Adds comment to database
db("INSERT INTO `comments`(`parent`,`author`,`body`,`edited`,`timestamp`) VALUES ({$values["parent"]}, {$values["user"]}, '{$values["body"]}', 0, {$values["timestamp"]})", false);



// Echo success
echo json_encode(array(
    "success" => true
));