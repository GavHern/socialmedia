<?php

/*

Parameters for this file: key, token, password, confirm

*/

// Requires (header information, database functions, authentication functions, utility functions)
include '../../tools/headers.php';
include '../../tools/db.php';
include '../../tools/auth.php';
include '../../tools/utils.php';


// Get all nessisary parameters and sanitize them
$values = array(
    "reset_key" => sanitize($_GET['key']),
    "token" => sanitize($_GET['token']),
    "password" => $_GET['password'],
    "confirm" => $_GET['confirm'],
    "timestamp" => time(),
    "expiration_time" => 600 // 10 minutes
);

// Validate that passwords match
if($values['password'] != $values['confirm']){
    throw_error("Passwords don't match");
}

// Validate password length
if(strlen($values["password"]) < 8){
    throw_error("Password must be at least 8 characters.");
}


// Get information surrounding the reset token
$token_data = db("SELECT * from reset_tokens WHERE reset_key = '{$values['reset_key']}' AND `used` = 0 AND timestamp > {$values['timestamp']} - {$values['expiration_time']} ORDER BY timestamp DESC LIMIT 1;", true)[0];
$token_is_valid = password_verify($values['token'], $token_data['token']);

// Verify token valitity
if(!$token_is_valid){
    throw_error("This link is invalid. Try making a new one.");
}


// Hash the new password
$new_password_hashed = password_hash($values['password'], PASSWORD_DEFAULT);


// Update database record
db("UPDATE `users` SET `password`='{$new_password_hashed}' WHERE `id` = {$token_data['account']};", false);

// Mark token as 'used'
db("UPDATE `reset_tokens` SET `used` = 1 WHERE `reset_key` = '{$values['reset_key']}';", false);


echo json_encode(array(
    "success" => true
));