<?php

// Escapes strings to prevent an SQL injection attack
function sanitize($string){
    include 'env.php';
    
    $connect = mysqli_connect("localhost", $env['username'], $env['password'], "gavhernc_apcsp");
    return mysqli_real_escape_string($connect, $string);
}



/*
Simulates an SQL query and returns it in associative array format.

$get_response determines if the function should return any data, otherwise it will just perform the query command.


*/

function db($query, $get_response){
    include 'env.php';
    
    // Create DB Connection
    $connect = mysqli_connect("localhost", $env['username'], $env['password'], "gavhernc_apcsp");
    
    $res = mysqli_query($connect, $query);
    
    if($res==false){
        return -1;
    }
    
    if($get_response){
        $array = array();
        
        while($row = mysqli_fetch_assoc($res)){
            $array[] = $row;
        }
        
        return $array;
    } else {
        return 0;
    }
}



