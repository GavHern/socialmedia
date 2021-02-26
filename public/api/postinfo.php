<?php

/*

Parameters for this file: post

*/



// Requires (header information, database functions, authentication functions, utility functions)
include 'tools/headers.php';
include 'tools/db.php';
include 'tools/auth.php';
include 'tools/utils.php';


// Get all nessisary parameters and sanitize them
$values = array(
    "user" => get_session(),
    "post" => $_GET['post']
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

Query Summary: Get post requested (and interpolate extra information)

Formatted SQL at the bottom of this file

*/

if($values['page_number']==0){
    $data = db("SELECT p.id, p.title, p.author, p.type, p.body, u.name, u.username, u.profile_picture,(SELECT COUNT(*) FROM `likes` WHERE `likes`.id = p.id AND `likes`.`is_comment` = false) likes, (SELECT COUNT(*) FROM `likes` WHERE `likes`.`user` = {$values['user']} AND `likes`.id = p.id AND `likes`.`is_comment` = false) liked, (SELECT COUNT(*) FROM `saved` WHERE `saved`.`user` = {$values['user']} AND `saved`.`post` = p.id) saved, (SELECT IF(p.author = {$values['user']}, 1, 0)) AS is_author, p.edited, p.timestamp FROM `posts` AS p INNER JOIN `users` AS u ON u.id = p.author WHERE p.id = {$values['post']};", true)[0];
} else {
    $data = -1;
}

$comments = db("SELECT c.id, c.body, c.author, u.name, u.username, u.profile_picture,(SELECT COUNT(*) FROM `likes` WHERE `likes`.id = c.id AND `likes`.`is_comment` = true) likes, (SELECT COUNT(*) FROM `likes` WHERE `likes`.`user` = {$values['user']} AND `likes`.id = c.id AND `likes`.`is_comment` = true) liked, (SELECT IF(c.author = {$values['user']}, 1, 0)) AS is_author, c.edited, c.timestamp FROM `comments` AS c INNER JOIN `users` AS u ON u.id = c.author WHERE c.parent = {$values['post']} ORDER BY c.timestamp DESC LIMIT {$values['page_length']} OFFSET {$values['post_number']}", true);


$next_checkpoint = base_convert($values['timestamp'],10,36)."-".$values['page_length']."-".($values['page_number']+1);


// Echo post information and its comments
echo json_encode(array(
    "success" => true,
    "data" => $data,
    "comments" => $comments,
    "checkpoint" => $next_checkpoint
));

/*

FORMATTED SQL

SELECT
    p.id, p.title, p.author, p.type, p.body, u.name, u.username, u.profile_picture,
    (SELECT COUNT(*) FROM `likes` WHERE `likes`.id = p.id AND `likes`.`is_comment` = false) likes,
    (SELECT COUNT(*) FROM `likes` WHERE `likes`.`user` = {$values['user']} AND `likes`.id = p.id AND `likes`.`is_comment` = false) liked,
    (SELECT COUNT(*) FROM `saved` WHERE `saved`.`user` = {$values['user']} AND `saved`.`post` = p.id) saved,
    (SELECT IF(p.author = {$values['user']}, 1, 0)) AS is_author,
    p.edited,
    p.timestamp
FROM
    `posts` AS p
    INNER JOIN `users` AS u
    ON u.id = p.author

    
WHERE
    id = {$values['post']}
    
    


SELECT
    c.id, c.body, c.author, u.name, u.username, u.profile_picture,
    (SELECT COUNT(*) FROM `likes` WHERE `likes`.id = c.id AND `likes`.`is_comment` = true) likes,
    (SELECT COUNT(*) FROM `likes` WHERE `likes`.`user` = {$values['user']} AND `likes`.id = c.id AND `likes`.`is_comment` = true) liked,
    (SELECT IF(c.author = {$values['user']}, 1, 0)) AS is_author,
    c.edited,
    c.timestamp
FROM
    `comments` AS c 
    INNER JOIN `users` AS u
    ON u.id = c.author
WHERE
    c.parent = {$values['post']}
ORDER BY c.timestamp DESC
LIMIT {$values['page_length']} OFFSET {$values['post_number']}

*/