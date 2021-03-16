<?php

function encrypt_message($message){
    include 'env.php';
    
    $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length('aes-256-cbc'));
    
    $cypher_text = openssl_encrypt($message, "aes-256-cbc", $env['secret'], 0, $iv)."::".base64_encode($iv);
    
    return $cypher_text;
}


function decrypt_message($cypher){
    include 'env.php';
    
    $cypher_parts = explode("::", $cypher);
    $cypher_text = $cypher_parts[0];
    $iv = base64_decode($cypher_parts[1]);
    
    $message = openssl_decrypt($cypher_text, 'aes-256-cbc', $env['secret'], 0, $iv);
    
    return $message;
}



// Looks up a session token to find the User ID associated with it
function session_to_user_id($session_token){
    $user_id = explode("-", $session_token)[0];

    $user_db_session = db("SELECT session FROM users WHERE id = '{$user_id}'", true)[0]['session'];

    if(decrypt_message($user_db_session) == $session_token)
        return $user_id;
    else 
        return "";
}


// Pull session from cookies and find corrosponding user id
function get_session(){
    
    if(!isset($_COOKIE["session"]) and !isset(apache_request_headers()['authentication'])){
        die(json_encode(array(
            "success" => false,
            "message" => "Missing login session"
        )));
    }
    
    $id = session_to_user_id(sanitize($_COOKIE["session"]));

    if($id == ""){
        $id = session_to_user_id(sanitize(apache_request_headers()['authentication']));
        
        if($id == ""){
            die(json_encode(array(
                "success" => false,
                "message" => "Invalid login session",
                "id" => $id
            )));
        }
    }
    
    return $id;
}


// Session tokens are the user's ID numeber, followed by a hyphen, followed by 24 random characters. The user ID is included to ensure that there are never duplucate session tokens in the database
function generate_session_token($id) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < 24; $i++) {
        $randomString .= $characters[rand(0, $charactersLength - 1)];
    }
    return $id."-".$randomString;
}