<?php

function throw_error($message){
    die(json_encode(array(
        "success" => false,
        "message" => $message
    )));
}

function randomString($length){
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[rand(0, $charactersLength - 1)];
    }
    return $randomString;
}


// Saves image to hosting service (imgbb)
function save_image($data){
    include 'env.php';
    
    // Initialize cURL sessipon
    $curl = curl_init();
    
    // Set cURL options
    curl_setopt_array($curl, array(
      CURLOPT_URL => "https://api.imgbb.com/1/upload", // URI for request
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_ENCODING => "",
      CURLOPT_MAXREDIRS => 10,
      CURLOPT_TIMEOUT => 0,
      CURLOPT_FOLLOWLOCATION => true,
      CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
      CURLOPT_CUSTOMREQUEST => "POST", // Use a POST request
      CURLOPT_POSTFIELDS => "key={$env['imgbb']}&image=".urlencode($data), // Form fields (including authenitcation and the image data)
      CURLOPT_HTTPHEADER => array(
        "Content-Type: application/x-www-form-urlencoded" // Use the header 'x-www-form-urlencoded'
      ),
    ));
    
    // Execute cURL request and parse JSON response as an associative array
    $res = json_decode(curl_exec($curl), true);
    
    // Close the cURL session
    curl_close($curl);

    
    // Check for errors
    if(!$res['success']){
        if($res['error']['code'] == 120){
            throw_error("The file you provided is not a valid image, or was malformed.");
        } else {
            throw_error($res);
        }
    }
    
    if(!isset($res['data']['medium']['url'])){
        $res['data']['medium']['url'] = $res['data']['url'];
    }
    
    // Generate a random filename with the current time in microseconds concatenated with a random string
    $filename = uniqid().'-'.randomString(16);
    
    // Create a database entry
    db("INSERT INTO `images`(`name`, `image`, `standard`, `thumb`, `remove`, `size`) VALUES ('{$filename}','{$res['data']['url']}','{$res['data']['medium']['url']}','{$res['data']['thumb']['url']}','{$res['data']['delete_url']}','{$res['data']['size']}')", false);
    
    // Return the filename
    return $filename;
    
}


function send_email($recipient, $subject, $message){
    $headers = "Reply-To: Gav Hern <no-reply@gavhern.com>\r\n"; 
    $headers .= "Return-Path: <no-reply@gavhern.com>\r\n"; 
    $headers .= "From: <no-reply@gavhern.com>\r\n";  
    $headers .= "Organization: Gav Hern\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=iso-8859-1\r\n";
    $headers .= "X-Priority: 3\r\n";
    $headers .= "X-Mailer: PHP". phpversion() ."\r\n" ;
    
    $mail_success = mail($recipient,$subject,$message,$headers);
    
    return $mail_success;
}





function parseMentionsWithUsername($matches){ // Function that parses <@id> ino <@id:username>
    $mention_id = preg_replace('/[\<\>\@]/', '', $matches[0]);
    $mention_username = db("SELECT username FROM `users` WHERE id = {$mention_id};",true)[0]['username'];
    return "<@{$mention_id}:{$mention_username}>";
}


function parseMentions($string){
    $pattern = '/\<@[0-9]+\>/';
    
    return preg_replace_callback($pattern, 'parseMentionsWithUsername', $string);
}


function parseMentionsToId($matches){// Function that parses @username into <@id>
    $mention_username = explode('@',$matches[0])[1];
    $mention_id = db("SELECT id FROM `users` WHERE LOWER(username) = LOWER('{$mention_username}');", true)[0]['id'];
    
    // If no user matches the username, don't mention anyone
    if(!isset($mention_id)){
        return $matches[0];
    }
    
    $id_tag = "<@{$mention_id}>";
    
    return $id_tag;
}


function stringToMentions($string){
    $pattern = '/([@][a-zA-Z0-9]{3,})/';
    return preg_replace_callback($pattern, 'parseMentionsToId', $string);
}