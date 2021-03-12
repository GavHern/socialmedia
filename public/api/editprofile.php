<?php

/*

Parameters for this file: name, username, bio, profile_picture, banner. All optional, only updates values supplied

*/


// Requires (header information, database functions, authentication functions, utility functions)
include 'tools/headers.php';
include 'tools/db.php';
include 'tools/auth.php';
include 'tools/utils.php';


// Get all nessisary parameters and sanitize them
$values = array(
    "user" => get_session(),
    "rate_limit" => 300, // Rate limit in seconds
    "timestamp" => time() // Get current timestamp
);



// Add all supplied values to the values array if they are supplied
if(isset($_POST['name'])){
    $values['name'] = sanitize($_POST['name']);
}

if(isset($_POST['username'])){
    $values['username'] = strtolower(sanitize($_POST['username']));
}

if(isset($_POST['bio'])){
    $values['bio'] = sanitize($_POST['bio']);
}

if(isset($_POST['profile_picture'])){
    $values['profile_picture'] = $_POST['profile_picture'];
}

if(isset($_POST['banner'])){
    $values['banner'] = $_POST['banner'];
}


// Rate limiting
$last_edited = db("SELECT `last_edited` FROM `users` WHERE `id` = {$values['user']}", true)[0]['last_edited'];

if($values['timestamp'] - $last_edited < $values['rate_limit'] and (isset($_POST['profile_picture']) or isset($_POST['banner']))){
    throw_error("You're doing that too much. Please wait 5 minutes in between profile updates.");
}



// Ensure they're changing at least one value
if(
    !isset($_POST['name']) &&
    !isset($_POST['username']) &&
    !isset($_POST['bio']) &&
    !isset($_POST['profile_picture']) &&
    !isset($_POST['banner'])
) {

    throw_error("No new values have been submitted.");

}


// Validate information

if(isset($values['name'])){ // Validate name
    if(strlen($values["name"]) > 64){ // Validate length
        throw_error("Your name is restricted to 64 characters. Sorry about that.");
    }
}


if(isset($values['username'])){ // Validate username
    if(strlen($values["username"]) < 3 || strlen($values["username"]) > 32){ // Validate length
        throw_error("Username must be between 3 and 32 characters.");
    }
    
    if(!ctype_alnum($values["username"])){ // Ensure username is alphanumeric
        throw_error("Username must be alphanumeric.");
    }
    
    // Check that username is not already taken
    $find_duplicate_username = db("SELECT `id` FROM `users` WHERE LOWER(username) = LOWER('{$values["username"]}');", true);

    if($find_duplicate_username != []){
        throw_error("That username is already in use.");
    }
}


if(isset($values['bio'])){ // validate name
    if(strlen($values["bio"]) > 512){ // Validate length
        throw_error("Your bio must be less than 512 characters. Sorry about that.");
    }
}



// Store images
if(isset($values['profile_picture'])){
    $values['profile_picture_url'] = save_image($values['profile_picture']);
}

if(isset($values['banner'])){
    $values['banner_url'] = save_image($values['banner']);
}


// Init array of sql update parameters
$sql_updates = [];



// Add an update argument for every value the user wishes to alter
if(isset($values['name'])){
    $sql_updates[] = "`name`='{$values['name']}'";
}

if(isset($values['username'])){
    $sql_updates[] = "`username`='{$values['username']}'";
}

if(isset($values['bio'])){
    $sql_updates[] = "`bio`='{$values['bio']}'";
}

if(isset($values['profile_picture_url'])){
    $sql_updates[] = "`profile_picture`='{$values['profile_picture_url']}'";
}

if(isset($values['banner_url'])){
    $sql_updates[] = "`banner`='{$values['banner_url']}'";
}
    




// Parse array into an sql command
$sql_command = "UPDATE `users` SET ".implode(',', $sql_updates)." WHERE `id` = {$values['user']}";


// Execute the command
db($sql_command, false);


// Get new data
$new_info = db("SELECT `id`,`name`,`username`,`profile_picture`,`banner`,`bio`, `timestamp` AS created FROM `users` WHERE `id` = {$values['user']};", true)[0];



// Echo success
echo json_encode(array(
    "success" => true,
    "info" => $new_info
));