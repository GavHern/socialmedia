<?php

/*

Parameters for this file: email (new email address), confirm (confirm new email), password

*/


// Requires (header information, database functions, authentication functions, utility functions)
include '../tools/headers.php';
include '../tools/db.php';
include '../tools/auth.php';
include '../tools/utils.php';


// Get all nessisary parameters and sanitize them
$values = array(
    "user" => get_session(),
    "email" => sanitize($_GET["email"]),
    "confirm" => sanitize($_GET["confirm"]),
    "password" => sanitize($_GET["password"])
);



// Make sure email addresses match
if($values['email'] != $values['confirm']){
    throw_error("Emails do not match");
}


// Check that the email address is valid
if(!filter_var($values["email"], FILTER_VALIDATE_EMAIL)) {
    throw_error("Invalid email address.");
}



// Lookup user's password, old email, and name
$account_info = db("SELECT `password`, `email`, `name` FROM `users` WHERE id = '{$values["user"]}';", true)[0];


// Lookup if the email is taken
$email_taken = db("SELECT COUNT(email) AS `exists` FROM `users` WHERE email = '{$values['email']}'", true)[0]['exists'];

if($email_taken != 0) {
    throw_error("That email is already taken");
}


// Confirm password
if(!password_verify($values["password"], $account_info["password"])){
    throw_error(array(
        "supplied" => $values["password"],
        "db" => $account_info["password"],
        "hashVerify" => password_verify($values["password"], $account_info["password"])
    ));
}


// Update email in database
db("UPDATE `users` SET `email`='{$values['email']}' WHERE `id` = {$values['user']};", false);



// Send email to old address
send_email($account_info['email'], 'Email changed on Emerald.', '<!DOCTYPE html><html> <head> <style>html,body{margin:0;padding:0;font-family:Roboto}header{width:100%;padding:8px 0;background-color:#6ee7b7;text-align:center;}main{padding:24px;margin:0 10%;font-size:18px}hr{border-style:dashed;border-color:#e5e7eb;margin:16px 0}a{color:#10b981}p{line-height:14px}</style> <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel=stylesheet> </head> <body> <header> <img src="https://i.ibb.co/SsDFbZk/icon-svg-1.png" alt="Logo"> </header> <main> <p>Hello, '.$account_info['name'].'.</p> <hr> <p>The account linked to this email has recently changed it\'s prefered email address.</p> <p>If this was not you, <a href=mailto:contact@gavhern.com>please contact us immediately</a>.</p> </main> </body></html>');


// Send email to new address
send_email($_GET['email'], 'Email changed on Emerald.', '<!DOCTYPE html><html> <head> <style>html,body{margin:0;padding:0;font-family:Roboto}header{width:100%;padding:8px 0;background-color:#6ee7b7;text-align:center;}main{padding:24px;margin:0 10%;font-size:18px}hr{border-style:dashed;border-color:#e5e7eb;margin:16px 0}a{color:#10b981}p{line-height:14px}</style> <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel=stylesheet> </head> <body> <header> <img src="https://i.ibb.co/SsDFbZk/icon-svg-1.png" alt="Logo"> </header> <main> <p>Hello, '.$account_info['name'].'.</p> <hr> <p>An emerald account has recently changed their preferred email to this address.</p> <p>If this was not you, <a href=mailto:contact@gavhern.com>please contact us</a>.</p> </main> </body></html>');




// Echo account id and new session
echo json_encode(array(
    "success" => true
));



/*

FORMATTED EMAIL (OLD ADDRESS):


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
            <p>The account linked to this email has recently changed it's prefered email address.</p>
            <p>If this was not you, <a href=mailto:contact@gavhern.com>please contact us immediately</a>.</p>
        </main>
    </body>
</html>






FORMATTED EMAIL (NEW ADDRESS):


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
            <p>An emerald account has recently changed their preferred email to this address.</p>
            <p>If this was not you, <a href=mailto:contact@gavhern.com>please contact us</a>.</p>
        </main>
    </body>
</html>


*/
