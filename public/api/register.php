<?php

/*

Parameters for this file: name, username, email, password, confirm

*/


// Requires (header information, database functions, authentication functions, utility functions)
include 'tools/headers.php';
include 'tools/db.php';
include 'tools/auth.php';
include 'tools/utils.php';


// Get all nessisary parameters and sanitize them
$values = array(
    "name" => sanitize($_GET["name"]),
    "username" => sanitize($_GET["username"]),
    "email" => sanitize($_GET["email"]),
    "password" => sanitize($_GET["password"]),
    "confirm" => sanitize($_GET["confirm"]),
    "timestamp" => time() // Get current timestamp
);




// Report error if the username is either too short or too long
if(strlen($values["username"]) < 3 || strlen($values["username"]) > 32){
    throw_error("Username must be between 3 and 32 characters.");
}

// Check that username is alphanumeric
if(!ctype_alnum($values["username"])){
    throw_error("Username must be alphanumeric.");
}

// Report error if the user's full name is over the allocated length
if(strlen($values["name"]) > 64){
    throw_error("Your name is restricted to 64 characters. Sorry about that.");
}

// Validate email
if (!filter_var($values["email"], FILTER_VALIDATE_EMAIL)) {
    throw_error("Please enter a valid email address.");
}

// Report error if the password and confirm dont match
if($values["password"] != $values["confirm"]){
    throw_error("Passwords do not match.");
}

// Report error if the user's password is too short
if(strlen($values["password"]) < 8){
    throw_error("Password must be at least 8 characters.");
}




// Check for duplicate credentials in the database
$find_duplicate_credentials = db("SELECT `id` FROM `users` WHERE username = '{$values["username"]}' OR email = '{$values["email"]}';", true);

// Kill program if duplicates are found
if($find_duplicate_credentials != []){
    throw_error("That username or email is already in use.");
}



// Hash the user's password for security
$values["password"] = password_hash($values["password"], PASSWORD_DEFAULT);




// Insert credentials into the database
db("INSERT INTO `users`(`name`,`username`,`email`,`password`,`timestamp`,`last_edited`) VALUES ('{$values["name"]}','{$values["username"]}','{$values["email"]}','{$values["password"]}',{$values["timestamp"]},{$values["timestamp"]});", false);


// Find the user ID
$user_id = db("SELECT `id` FROM `users` WHERE username = '{$values["username"]}';", true)[0]['id'];


// Generate a session token
$session_token = generate_session_token($user_id);


// Add the session token to the user's database entry
db("UPDATE `users` SET `session`='{$session_token}' WHERE id = {$user_id}", false);





// Add the user's session ID to their cookie jar for 30 days
setcookie("session", $account_data["session"], time()+30*24*60*60);



// Echo new account information
echo json_encode(array(
    "success" => true,
    "user_id" => $user_id,
    "session_token" => $session_token
));