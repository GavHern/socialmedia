<?php

/*

Parameters for this file: login (username or email), password

*/


// Requires (header information, database functions, authentication functions, utility functions)
include 'tools/headers.php';
include 'tools/db.php';
include 'tools/auth.php';
include 'tools/utils.php';


// Get all nessisary parameters and sanitize them
$values = array(
    "login" => sanitize($_GET["login"]),
    "password" => $_GET["password"]
);





// Find the id and password of a user with the provided email or password
$account_data = db("SELECT `id`, `password`, `session` FROM `users` WHERE LOWER(username) = LOWER('{$values["login"]}') OR email = '{$values["login"]}';", true)[0];





// If the username or email didnt match any records, return an error and kill the program
if($account_data == null){
    throw_error("That user doesn't exist");
}


// Checks provided password against hash. If it's incorrect, it returns an error and kills the program.
if(!password_verify($values["password"], $account_data["password"])){
    throw_error("Password didn't match the username or email");
}




// Add the user's session ID to their cookie jar for 30 days
setcookie("session", $account_data["session"], time()+30*24*60*60);



// Echo account id and new session
echo json_encode(array(
    "success" => true,
    "user_id" => $account_data["id"],
    "session_token" => $account_data["session"]
));