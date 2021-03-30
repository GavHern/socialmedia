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
    "ip_address" => $_SERVER['REMOTE_ADDR'],
    "rate_limit" => 3600,
    "timestamp" => time() // Get current timestamp
);


// Find accounts created with the same IP address
$last_time_ip_was_used = db("SELECT `timestamp` FROM `users` WHERE `created_ip` = '{$values['ip_address']}' ORDER BY `timestamp` DESC;", true)[0]['timestamp'];


// Check if the client's IP has been used to create an account during the rate limit period
if($values['timestamp'] - $last_time_ip_was_used < $values['rate_limit']){
    throw_error("You're doing this too fast!");
}




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
$find_duplicate_credentials = db("SELECT `id` FROM `users` WHERE LOWER(username) = LOWER('{$values['username']}') OR LOWER(email) = LOWER('{$values['email']}')", true);

// Kill program if duplicates are found
if($find_duplicate_credentials != []){
    throw_error("That username or email is already in use.");
}



// Hash the user's password for security
$values["password"] = password_hash($values["password"], PASSWORD_DEFAULT);




// Insert credentials into the database
db("INSERT INTO `users`(`name`,`username`,`email`,`password`,`created_ip`,`timestamp`,`last_edited`) VALUES ('{$values["name"]}','{$values["username"]}','{$values["email"]}','{$values["password"]}','{$values['ip_address']}',{$values["timestamp"]},{$values["timestamp"]});", false);


// Find the user ID
$user_id = db("SELECT `id` FROM `users` WHERE username = '{$values["username"]}';", true)[0]['id'];


// Generate a session token
$session_token = generate_session_token($user_id);

$session_encrypted = encrypt_message($session_token);


// Add the session token to the user's database entry
db("UPDATE `users` SET `session`='{$session_encrypted}' WHERE id = {$user_id}", false);





// Add the user's session ID to their cookie jar for 30 days
setcookie("session", $account_data["session"], time()+30*24*60*60);


// Email the user alerting about signup
send_email($_GET["email"], "Welcome to Emerald!", '<!DOCTYPE html><head><style>html,body{margin:0;padding:0;font-family:Roboto}header{width:100%;padding:8px 0;background-color:#6ee7b7;text-align:center;}main{padding:24px;margin:0 10%;font-size:18px}hr{border-style:dashed;border-color:#e5e7eb;margin:16px 0}a{color:#10b981}p{line-height:14px}</style><link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel=stylesheet></head><html><body><header><img src="https://i.ibb.co/SsDFbZk/icon-svg-1.png" alt="Logo"></header><main><p>Hello, '.$values["name"].'.</p><hr><p>Thank you for signing up for Emerald, it\'s great to have you!</p><p>If you believe this was a mistake or have any feedback, be sure to <a href=mailto:contact@gavhern.com>contact us</a>.</p><br><p>Sincerely,</p><p>The Emerald Team</p><p><a href=https://gavhern.com>https://gavhern.com</a></p></main></body></html>');

// Echo new account information
echo json_encode(array(
    "success" => true,
    "user_id" => $user_id,
    "session_token" => $session_token
));

/*

FORMATTED EMAIL:


<!DOCTYPE html>
<html>
    <head>
        <style>html,body{margin:0;padding:0;font-family:Roboto}header{width:100%;padding:8px 0;background-color:#6ee7b7;text-align:center;}main{padding:24px;margin:0 10%;font-size:18px}hr{border-style:dashed;border-color:#e5e7eb;margin:16px 0}a{color:#10b981}p{line-height:14px}</style>
        <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel=stylesheet>
    </head>
    <body>
        <header>
            <img src="https://i.ibb.co/SsDFbZk/icon-svg-1.png" alt="Logo">
        </header>
        <main>
            <p>Hello, {{name}}.</p>
            <hr>
            <p>Thank you for signing up for Emerald, it's great to have you!</p>
            <p>If you believe this was a mistake or have any feedback, be sure to <a href=mailto:contact@gavhern.com>contact us</a>.</p>
            <br>
            <p>Sincerely,</p>
            <p>The Emerald Team</p>
            <p><a href=https://gavhern.com>https://gavhern.com</a></p>
        </main>
    </body>
</html>


*/