<?php

/*

Parameters for this file: user (account to view), Optional parameter "checkpoint". Checkpoints are formatted: [unix timestamp of first request in base 36]-[records per page]-[page number]. Example: qndiwb-25-7

*/



// Requires (header information, database functions, authentication functions, utility functions)
include 'tools/headers.php';
include 'tools/db.php';
include 'tools/auth.php';
include 'tools/utils.php';


// Get all nessisary parameters and sanitize them
$values = array(
    "user" => get_session(),
    "profile" => $_GET['user'],
    "timestamp" => time() // Get current timestamp
);

// Check for pagination checkpoint, otherwise create one
if(isset($_GET['checkpoint'])){
    $values['checkpoint'] = sanitize($_GET['checkpoint']);
} else {
    $values['checkpoint'] = sanitize(base_convert(time(),10,36)."-25-0");
    
    // Log visit to visits table
    db("INSERT INTO `visits`(`page`, `user`, `data`, `timestamp`) VALUES ('profile',{$values['user']},{$values['profile']},{$values['timestamp']})", false);
}

// Parse pagination checkpoint (split at every hyphen)
$pagination_data = explode("-",$values['checkpoint']);

// Set values from pagination data
$values['timestamp'] = base_convert($pagination_data[0],36,10);
$values['page_length'] = $pagination_data[1];
$values['page_number'] = $pagination_data[2];
$values['post_number'] = $pagination_data[2] * $values['page_length'];

if($values['page_number']==0){
    $info = db("SELECT `id`,`name`,`username`,`profile_picture`,`banner`,`bio`, `timestamp` AS created,( SELECT DISTINCT COUNT(*) FROM (SELECT `user` AS `users` FROM `follows` WHERE `follow`={$values['profile']}) AS F1 INNER JOIN (SELECT `follow` AS `users` FROM `follows` WHERE `user`={$values['user']}) AS F2 USING(`users`)) mutual, (SELECT COUNT(*) FROM `follows` WHERE `follow` = {$values['profile']}) followers, (SELECT COUNT(*) FROM `follows` WHERE `user` = {$values['profile']}) following, (SELECT COUNT(*) FROM `follows` WHERE `user` = {$values['user']} AND `follow` = {$values['profile']}) AS is_following, (SELECT IF(users.id = {$values['user']}, 1, 0)) AS is_owner FROM `users` WHERE `id` = {$values['profile']};", true)[0];
} else {
    $info = -1;
}


/*
Get information from the database

Query Summary: Get all posts where from someone the user follows (or themself), that were created before the initial request, ordered by newest. Filter the posts to only the desired number of posts that come after the previous page

Formatted SQL at the bottom of this file

*/

$posts = db("SELECT p.id, p.title, p.author, p.type, p.body, u.name, u.username, u.profile_picture,(SELECT COUNT(*) FROM `likes` WHERE `likes`.id = p.id) likes, (SELECT COUNT(*) FROM `likes` WHERE `likes`.`user` = {$values['user']} AND `likes`.id = p.id AND `likes`.`is_comment` = false) liked, (SELECT COUNT(*) FROM `saved` WHERE `saved`.`user` = {$values['user']} AND `saved`.`post` = p.id) saved, (SELECT IF(p.author = {$values['user']}, 1, 0)) AS is_author, p.timestamp FROM `posts` AS p INNER JOIN `users` AS u ON u.id = p.author WHERE p.author = {$values['profile']} ORDER BY p.timestamp DESC LIMIT {$values['page_length']} OFFSET {$values['post_number']};", true);


$next_checkpoint = base_convert($values['timestamp'],10,36)."-".$values['page_length']."-".($values['page_number']+1);


// Echo success
echo json_encode(array(
    "success" => true,
    "info" => $info,
    "posts" => $posts,
    "checkpoint" => $next_checkpoint
));

/*

FORMATTED SQL

Profile info:

SELECT
    `id`,`name`,`username`,`profile_picture`,`banner`,`bio`,
    `timestamp` AS created,
    (
    SELECT DISTINCT COUNT(*) FROM 
        (SELECT `user` AS `users` FROM `follows` WHERE `follow`={$values['profile']}) AS F1
        INNER JOIN
        (SELECT `follow` AS `users` FROM `follows` WHERE `user`={$values['user']}) AS F2
        USING(`users`)
    ) mutual,
    (SELECT COUNT(*) FROM `follows` WHERE `follow` = {$values['profile']}) followers,
    (SELECT COUNT(*) FROM `follows` WHERE `user` = {$values['profile']}) following,
    (SELECT COUNT(*) FROM `follows` WHERE `user` = {$values['user']} AND `follow` = {$values['profile']}) AS is_following,
    (SELECT IF(users.id = {$values['user']}, 1, 0)) AS is_owner
FROM
    `users`
WHERE
    `id` = {$values['profile']}
    
    
    
    
User's posts:


SELECT
    p.id, p.title, p.author, p.type, p.body, u.name, u.username, u.profile_picture,
    (SELECT COUNT(*) FROM `likes` WHERE `likes`.id = p.id) likes,
    (SELECT COUNT(*) FROM `likes` WHERE `likes`.`user` = {$values['user']} AND `likes`.id = p.id AND `likes`.`is_comment` = false) liked,
    (SELECT COUNT(*) FROM `saved` WHERE `saved`.`user` = {$values['user']} AND `saved`.`post` = p.id) saved,
    (SELECT IF(p.author = {$values['user']}, 1, 0)) AS is_author,
    p.timestamp
FROM
    `posts` AS p
    INNER JOIN `users` AS u
    ON u.id = p.author

    
WHERE
    p.author = {$values['profile']}
ORDER BY
    p.timestamp
DESC
LIMIT {$values['page_length']} OFFSET {$values['post_number']}

*/