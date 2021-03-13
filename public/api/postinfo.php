<?php

/*

Parameters for this file: post (id of the post)

*/



// Requires (header information, database functions, authentication functions, utility functions)
include 'tools/headers.php';
include 'tools/db.php';
include 'tools/auth.php';
include 'tools/utils.php';


// Get all nessisary parameters and sanitize them
$values = array(
    "user" => get_session(),
    "post" => sanitize($_GET['post'])
);


$post_exists = db("SELECT COUNT(*) AS `exists` FROM posts WHERE id = {$values['post']}", true)[0]['exists'] != 0;

if(!$post_exists){
    throw_error("That post doesn't exist");
}


if(isset($_GET["thread"]))
    $values['thread'] = $_GET['thread'];
else
    $values['thread'] = 0;



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

    $data['body'] = parseMentions($data['body']);
} else {
    $data = -1;
}


function getCommentThread($thread_id, $thread_checkpoint){
    global $values;
    
    $list_sort = $thread_id == 0 ? 'DESC' : 'ASC'; // Make comments sort newest first for the parent thread and oldest first within child threads.
    
    $comments = db("SELECT c.id, c.body, c.parent, c.author, u.name, u.username, u.profile_picture,(SELECT COUNT(*) FROM `likes` WHERE `likes`.id = c.id AND `likes`.`is_comment` = true) likes, (SELECT COUNT(*) FROM `likes` WHERE `likes`.`user` = {$values['user']} AND `likes`.id = c.id AND `likes`.`is_comment` = true) liked, (SELECT IF(c.author = {$values['user']}, 1, 0)) AS is_author, (SELECT COUNT(*) FROM `comments` WHERE `thread` = c.id) replies, c.edited, c.thread, c.timestamp FROM `comments` AS c INNER JOIN `users` AS u ON u.id = c.author WHERE c.parent = {$values['post']} AND c.thread = {$thread_id} ORDER BY c.timestamp {$list_sort} LIMIT {$values['page_length']} OFFSET {$values['post_number']}", true);
    
    $i = 0; // Initialize iterator
    
    foreach($comments as $comment){
        $comments[$i]['body'] = parseMentions($comment['body']);
        
        if($comment['replies'] > 0)
            $reply_list = getCommentThread($comment['id'], base_convert(time(),10,36)."-5-0");
        else
            $reply_list = array();
        
        
        $comments[$i]['replies'] = $reply_list;
        
        $i++;
    }
    
    return $comments;
}


$comments = getCommentThread(0, $values['checkpoint']);



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
    (SELECT COUNT(*) FROM `comments` WHERE `thread` = c.id) replies,
    c.edited,
    c.thread,
    c.timestamp
FROM
    `comments` AS c 
    INNER JOIN `users` AS u
    ON u.id = c.author
WHERE
    c.parent = {$values['post']} AND c.thread = 0
ORDER BY c.timestamp DESC
LIMIT {$values['page_length']} OFFSET {$values['post_number']}

*/