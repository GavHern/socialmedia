<?php


// Requires (header information, database functions, authentication functions, utility functions)
include 'tools/headers.php';
include 'tools/db.php';
include 'tools/auth.php';
include 'tools/utils.php';


// Get all nessisary parameters and sanitize them
$values = array(
    "user" => get_session()
);


// Make a new session token
$new_session = generate_session_token($values["user"]);

$session_encrypted = encrypt_message($new_session);


// Override existing session token with the new one
db("UPDATE `users` SET `session`='{$session_encrypted}' WHERE `id`={$values["user"]}", true);


// Echo new account information
echo json_encode(array(
    "success" => true
));