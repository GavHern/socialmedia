<?php

/*
    Parameters: f (filename), thumb (if present, requests a thumbnailed image)
*/

header('Content-Type: image/png');
//header('Cache-Control: no-cache');
include 'tools/db.php';

// Image to return if there's an error
$error_image = "https://i.ibb.co/4pfcspn/1f1aa9815420.png";


// Get the images from the database
$images = db("SELECT * FROM `images` WHERE `name`='{$_GET['f']}';", true)[0];



if(empty($images)){ // If there are no database records matching the filename, throw an error
    $image_url = $error_image;
} elseif(isset($_GET['thumb'])){ // Check if user wants a thumbnailed image
    $image_url = $images['thumb'];
} elseif(isset($_GET['hd'])){ // Check if user wants an hd image (unalterd aspect ratio)
    $image_url = $images['image'];
} else { // Get standard definition image
    $image_url = $images['standard'];
}


// Initialize cURL
$curl = curl_init();

// Set cURL options
curl_setopt_array($curl, array(
  CURLOPT_URL => $image_url, // URI
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => 'GET', // GET request
));

// Execute cURL command
$response = curl_exec($curl);

curl_close($curl);

// If the request failed, return an error
if($response === false){
    http_response_code(500);
    die(-1);
}


echo $response;
