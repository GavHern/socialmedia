<?php

/*

Parameters for this file: title, type (text, image), body (Text body, image data in base64)

*/


// Requires (header information, database functions, authentication functions, utility functions)
include 'tools/headers.php';
include 'tools/db.php';
include 'tools/auth.php';
include 'tools/utils.php';


// Get all nessisary parameters and sanitize them
$values = array(
    "user" => get_session(),
    "title" => sanitize($_POST['title']),
    "type" => sanitize($_POST['type']),
    "rate_limit" => 300, // Rate limit time in seconds
    "timestamp" => time() // Get current timestamp
);


// Ensure title is provided
if(strlen($values['title']) <= 0){
    throw_error("Please provide a title");
}


// Get the timestap of the user's previous post
$previous_post_timestamp = db("SELECT `timestamp` FROM `posts` WHERE `author` = {$values['user']} ORDER BY `timestamp` DESC;", true)[0]['timestamp'];

// Check if it was within the past 5 minutes (300 seconds), and rate limit if necessary
if($values['timestamp'] - $previous_post_timestamp < $values['rate_limit']){
    throw_error("You're doing that too much. Try again later.");
}


// Check what kind of post it is. Process post body seperatly
switch ($values['type']) {
  case 'text':
    $values['body'] = sanitize($_POST['body']);
    break;
  case 'image':
    $values['body'] = save_image($_POST['body']);
    break;
  default:
    throw_error("Unknown type of post.");
}

// Check for mentions
if($values['type']){
    // Function that parses @username into <@id>
    function parseMentionsToId($matches){
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
    
    $pattern = '/(^|[ ])([@][a-zA-Z0-9]{3,})/';
    
    $values['body'] = preg_replace_callback($pattern, 'parseMentionsToId', $values['body']);
}


// Add post to database
db("INSERT INTO `posts`(`title`, `author`, `type`, `body`, `edited`, `timestamp`) VALUES ('{$values['title']}',{$values['user']},'{$values['type']}','{$values['body']}',0,{$values['timestamp']})", false);


// Get the user's newest post (the one they just created)
$post_id = db("SELECT `id` FROM `posts` WHERE `author` = {$values['user']} ORDER BY `timestamp` DESC;", true)[0]['id'];


// Echo post id
echo json_encode(array(
    "success" => true,
    "post_id" => $post_id
));