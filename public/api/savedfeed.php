<?php

/*

Parameters for this file: Optional parameter "checkpoint". Checkpoints are formatted: [unix timestamp of first request in base 36]-[records per page]-[page number]. Example: qndiwb-25-7

*/



// Requires (header information, database functions, authentication functions, utility functions)
include 'tools/headers.php';
include 'tools/db.php';
include 'tools/auth.php';
include 'tools/utils.php';


// Get all nessisary parameters and sanitize them
$values = array(
    "user" => get_session()
);

// Check for pagination checkpoint, otherwise create one
if(isset($_GET['checkpoint'])){
    $values['checkpoint'] = sanitize($_GET['checkpoint']);
} else {
    $values['checkpoint'] = sanitize(base_convert(time(),10,36)."-25-0");
}

// Parse pagination checkpoint (split at every hyphen)
$pagination_data = explode("-",$values['checkpoint']);

// Set values from pagination data
$values['timestamp'] = base_convert($pagination_data[0],36,10);
$values['page_length'] = $pagination_data[1];
$values['page_number'] = $pagination_data[2];
$values['post_number'] = $pagination_data[2] * $values['page_length'];


/*
Get information from the database

Query Summary: Get all posts saved by the user, sorted by time saved

Formatted SQL at the bottom of this file

*/

$data = db("SELECT p.id, p.title, p.author, p.type, p.body, u.name, u.username, u.profile_picture,(SELECT COUNT(*) FROM `likes` WHERE `likes`.id = p.id) likes, (SELECT COUNT(*) FROM `likes` WHERE `likes`.`user` = {$values['user']} AND `likes`.id = p.id AND `likes`.`is_comment` = false) liked, (1) saved, (SELECT IF(p.author = {$values['user']}, 1, 0)) AS is_author, p.edited, p.timestamp FROM `posts` AS p INNER JOIN `users` AS u ON u.id = p.author INNER JOIN `saved` AS s ON s.user = {$values['user']} AND s.post = p.id ORDER BY s.timestamp DESC LIMIT {$values['page_length']} OFFSET {$values['post_number']};", true);


$next_checkpoint = base_convert($values['timestamp'],10,36)."-".$values['page_length']."-".($values['page_number']+1);


// Echo saved posts and new checkpoint
echo json_encode(array(
    "success" => true,
    "data" => $data,
    "checkpoint" => $next_checkpoint
));

/*

FORMATTED SQL



SELECT
    p.id, p.title, p.author, p.type, p.body, u.name, u.username, u.profile_picture,
    (SELECT COUNT(*) FROM `likes` WHERE `likes`.id = p.id) likes,
    (SELECT COUNT(*) FROM `likes` WHERE `likes`.`user` = {$values['user']} AND `likes`.id = p.id AND `likes`.`is_comment` = false) liked,
    (1) saved,
    (SELECT IF(p.author = {$values['user']}, 1, 0)) AS is_author,
    p.edited,
    p.timestamp
FROM
    `posts` AS p
    INNER JOIN `users` AS u
    ON u.id = p.author
    INNER JOIN `saved` AS s
    ON s.user = {$values['user']} AND s.post = p.id
    
ORDER BY
    s.timestamp
DESC
LIMIT {$values['page_length']} OFFSET {$values['post_number']}




*/