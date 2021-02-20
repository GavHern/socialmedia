<?php

// Looks up a session token to find the User ID associated with it
function session_to_user_id($session_token){
    return db("SELECT id FROM users WHERE session = '{$session_token}'", true)[0]['id'];
}

// Pull session from cookies and find corrosponding user id
function get_session(){
    
    
    if(!isset($_COOKIE["session"]) and !isset(apache_request_headers()['authentication'])){
        die(json_encode(array(
            "success" => false,
            "message" => "Missing login session",
            "data" => $_SERVER
        )));
    }
    
    $id = session_to_user_id(sanitize($_COOKIE["session"]));

    if($id == ""){
        $id = session_to_user_id(sanitize(apache_request_headers()['authentication']));
        
        if($id == ""){
            die(json_encode(array(
                "success" => false,
                "message" => "Invalid login session"
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