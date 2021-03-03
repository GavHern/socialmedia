<?php

/*

Parameters for this file: id (id of post or comment), is_comment (if the item is a post or a comment), body (new body text)

*/



// Requires (header information, database functions, authentication functions, utility functions)
include 'tools/headers.php';
include 'tools/db.php';
include 'tools/auth.php';
include 'tools/utils.php';


// Get all nessisary parameters and sanitize them
$values = array(
    "user" => get_session(),
    "id" => sanitize($_GET['id']),
    "is_comment" => $_GET['is_comment'],
    "body" => sanitize($_GET['body'])
);


// Check for mentions
function parseMentionsToId($matches){// Function that parses @username into <@id>
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



if(!$values['is_comment']){ // Edit a post
    $can_edit = db("SELECT COUNT(*) AS can_edit FROM `posts` WHERE id = {$values['id']} AND author = {$values['user']};",true)[0]['can_edit']; // Check if user is allowed to edit the post
    
    // If the user has permission, edit the post.
    if($can_edit == 1){
        $is_text_post = db("SELECT `type` FROM `posts` WHERE id = {$values['id']};",true)[0]['type']; // Check if post is not a text post
        
        if($is_text_post != 'text'){
            throw_error("You can only edit text posts.");
        }
        
        db("UPDATE `posts` SET `body`='{$values['body']}',`edited`=1 WHERE `id`={$values['id']}", false); // Edit post
    } else {
        throw_error("You don't have permission to edit that post.");
    }
    
} else { // Edit a comment
    $can_edit = db("SELECT COUNT(*) AS can_edit FROM `comments` WHERE id = {$values['id']} AND author = {$values['user']}",true)[0]['can_edit']; // Check if user is allowed to edit the comment
    
    // If the user has permission, edit the comment.
    if($can_edit == 1){
        db("UPDATE `comments` SET `body`='{$values['body']}',`edited`=1 WHERE `id`={$values['id']}", false); // Edit post
    } else {
        throw_error("You don't have permission to edit that comment.");
    }
}




// Echo success
echo json_encode(array(
    "success" => true,
    "data" => $values['body']
));
