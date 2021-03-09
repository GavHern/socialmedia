<?php

/*

Parameters for this file: email

*/



// Requires (header information, database functions, authentication functions, utility functions)
include '../../tools/headers.php';
include '../../tools/db.php';
include '../../tools/auth.php';
include '../../tools/utils.php';


// Get all nessisary parameters and sanitize them
$values = array(
    "email" => sanitize($_GET['email']),
    "ip_address" => sanitize($_SERVER['REMOTE_ADDR']),
    "timestamp" => time() // Get current timestamp
);


// Lookup user based on email
$values['user'] = db("SELECT id FROM users WHERE email = '{$values['email']}'", true)[0]['id'];

if(!isset($values['user']) OR !isset($_GET['email'])){
    throw_error("Invalid email address");
}


// Generate new reset token
$new_token = bin2hex(random_bytes(32));
$reset_key = bin2hex(random_bytes(4)).base_convert($values['account'],10,32);

$reset_url = "https://socialmedia.gavhern.com/api/reset/password/?key=".urlencode($reset_key)."&token=".urlencode($new_token);

$token_hashed = password_hash($new_token, PASSWORD_DEFAULT);


// Insert new token into the database
db("INSERT INTO `reset_tokens`(`account`, `reset_key`, `token`, `timestamp`, `ip_address`) VALUES ({$values['user']}, '{$reset_key}', '{$token_hashed}', {$values['timestamp']}, '{$values['ip_address']}');", false);


// Get the email record from the users account
$account_data = db("SELECT email, name FROM users WHERE id = {$values['user']}", true)[0];


// Send email to the user
send_email($account_data['email'], "Reset your password on emerald", '<!DOCTYPE html><html> <head> <style>html,body{margin:0;padding:0;font-family:Roboto}header{width:100%;padding:8px 0;background-color:#6ee7b7;text-align:center;}main{padding:24px;margin:0 10%;font-size:18px}hr{border-style:dashed;border-color:#e5e7eb;margin:16px 0}a{color:#10b981}p{line-height:14px}</style> <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel=stylesheet> </head> <body> <header> <img src="https://i.ibb.co/SsDFbZk/icon-svg-1.png" alt="Logo"> </header> <main> <p>Hello, '.$account_data['name'].'.</p> <hr> <p>A password reset was requested for your emerald account. Click the button below to reset your password</p> <div style="padding: 18px 0;"> <a href="'.$reset_url.'" style="background:#6EE7B7; padding: 16px; color: #ffffff; border-radius: 12px; text-decoration: none;">Reset password</a> </div> <p>If this wasn\'t you, you may ignore this email. This link will expire in 10 minutes.</p> </main> </body></html>');


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
            <p>A password reset was requested for your emerald account. Click the button below to reset your password</p>
            <div style="padding: 18px 0;">
              <a href="{{reset url}}" style="background:#6EE7B7; padding: 16px; color: #ffffff; border-radius: 12px; text-decoration: none;">Reset password</a>
            </div>
            <p>If this wasn't you, you may ignore this email. This link will expire in 10 minutes.</p>
        </main>
    </body>
</html>


*/