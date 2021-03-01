<?php

/*

Parameters for this file: password (confirmation to ensure they want to delete their account)

*/



// Requires (header information, database functions, authentication functions, utility functions)
include 'tools/headers.php';
include 'tools/db.php';
include 'tools/auth.php';
include 'tools/utils.php';


// Get all nessisary parameters and sanitize them
$values = array(
    "user" => get_session(),
    "password" => $_GET['password']
);

$account_password = db("SELECT `password` FROM `users` WHERE id = {$values['user']};", true)[0]['password'];


if(!password_verify($values["password"], $account_password)){
    throw_error("That password is incorrect.");
}

db("DELETE FROM `saved` WHERE `post` IN (SELECT `id` FROM `posts` WHERE `author` = {$values['user']})", false); // Delete all saves where the post is authored by the user

db("DELETE FROM `likes` WHERE `is_comment` = 0 AND `id` IN (SELECT `id` FROM `posts` WHERE `author` = {$values['user']})", false); // Delete all post likes where the post is authored by the user

db("DELETE FROM `likes` WHERE `is_comment` = 1 AND `id` IN (SELECT `id` FROM `comments` WHERE `author` = {$values['user']})", false); // Delete all commment likes where the comment is authored by the user



db("DELETE FROM `users` WHERE `id` = {$values['user']}", false); // Delete the user from the users table

db("DELETE FROM `posts` WHERE `author` = {$values['user']}", false); // Delete user's posts

db("DELETE FROM `comments` WHERE `author` = {$values['user']}", false); // Delete user's comments

db("DELETE FROM `follows` WHERE `user` = {$values['user']} OR `follow` = {$values['user']}", false); // Delete any follows in the database linked to the user's account

db("DELETE FROM `saved` WHERE `user` = {$values['user']}", false); // Delete user's saved posts

db("DELETE FROM `likes` WHERE `user` = {$values['user']}", false); // Delete user's liked posts and comments

db("SELECT * FROM `visits` WHERE `page` = 'profile' AND (`user` = {$values['user']} OR `data` = {$values['user']})", false); // Delete user from visits table




// Echo new account information
echo json_encode(array(
    "success" => true
));
