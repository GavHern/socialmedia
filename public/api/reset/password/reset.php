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

// Get user's email address
$user_info = db("SELECT email, name FROM users WHERE id = {$token_data['account']}", true)[0];


// Send email notice
send_email($user_info['email'], "Security Notice: Your Emerald password has been reset", '<!DOCTYPE html><html> <head> <style>html,body{margin:0;padding:0;font-family:Roboto}header{width:100%;padding:8px 0;background-color:#6ee7b7;text-align:center;}main{padding:24px;margin:0 10%;font-size:18px}hr{border-style:dashed;border-color:#e5e7eb;margin:16px 0}a{color:#10b981}p{line-height:14px}</style> <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel=stylesheet> </head> <body> <header> <img src="https://i.ibb.co/SsDFbZk/icon-svg-1.png" alt="Logo"> </header> <main> <p>Hello, '.$user_info['name'].'.</p> <hr> <p>Your emerald password has recently been reset.</p> <p>If this wasn\'t you, please reset your emerald password and secure your email account.</p> <p><a href="mailto:contact@gavhern.com">Plese contact us if you have any questions</a>.</p> </main> </body></html>');


echo json_encode(array(
    "success" => true
));

/*

FORMATTED HTML:



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
            <p>Your emerald password has recently been reset.</p>
            <p>If this wasn't you, please reset your emerald password and secure your email account.</p>
            <p><a href="mailto:contact@gavhern.com">Plese contact us if you have any questions</a>.</p>
        </main>
    </body>
</html>



*/
