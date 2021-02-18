<?php

/*

Parameters for this file: id (id of post or comment), is_comment (if the item is a post or a comment)

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
    "is_comment" => $_GET['is_comment']
);


if(!$values['is_comment']){ // Delete a post
    $can_delete = db("SELECT COUNT(*) AS can_delete FROM `posts` WHERE id = {$values['id']} AND author = {$values['user']}",true)[0]['can_delete']; // Check if user is allowed to delete the post
    
    // If the user has permission, delete the post.
    if($can_delete == 1){
        db("DELETE FROM `posts` WHERE `id` = {$values['id']}", false); // Delete post
        db("DELETE FROM `likes` WHERE `user`={$values['user']} AND `id`={$values['id']} AND `is_comment`=0", false); // Remove likes
        db("DELETE FROM `saved` WHERE `user`={$values['user']} AND `post`={$values['id']}", false); // Remove saves
    } else {
        throw_error("You don't have permission to delete that post.");
    }
    
} else { // Delete a comment
    $can_delete = db("SELECT COUNT(*) AS can_delete FROM `comments` WHERE id = {$values['id']} AND author = {$values['user']}",true)[0]['can_delete']; // Check if user is allowed to delete the comment
    
    // If the user has permission, delete the comment.
    if($can_delete == 1){
        db("DELETE FROM `comments` WHERE `id` = {$values['id']}", false); // Delete post
        db("DELETE FROM `likes` WHERE `user`={$values['user']} AND `id`={$values['id']} AND `is_comment`=1", false); // Remove likes
    } else {
        throw_error("You don't have permission to delete that comment.");
    }
}




// Echo new account information
echo json_encode(array(
    "success" => true
));
