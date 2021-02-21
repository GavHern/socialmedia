<?php

/*

Parameters for this file: user (id of the user)

*/



// Requires (header information, database functions, authentication functions, utility functions)
include 'tools/headers.php';
include 'tools/db.php';
include 'tools/auth.php';
include 'tools/utils.php';


// Get all nessisary parameters and sanitize them
$values = array(
    "user" => get_session(),
    "profile" => sanitize($_GET['user']),
    "feed" => $_GET['feed']
);

if($values['feed'] == "mutual"){
    
    $data = db("SELECT DISTINCT mutual AS id, u.name, u.username, u.profile_picture, (SELECT COUNT(*) FROM `follows` AS f WHERE f.follow = u.id AND f.user = {$values['user']}) is_following FROM( SELECT `user` AS `mutual` FROM `follows` WHERE `follow` = {$values['profile']}) AS F1 INNER JOIN ( SELECT `follow` AS `mutual` FROM `follows` WHERE `user` = {$values['user']} ) AS F2 USING(`mutual`) INNER JOIN `users` AS u ON u.id = mutual;", true);
    
} else if ($values['feed'] == "followers"){
    
    $data = db("SELECT f.user AS id, u.name, u.username, u.profile_picture, (SELECT COUNT(*) FROM `follows` AS f WHERE f.follow = u.id AND f.user = {$values['user']}) is_following FROM `follows` as f INNER JOIN `users` AS u ON u.id = f.user WHERE f.follow = {$values['profile']};", true);
    
} else if ($values['feed'] == "following"){
    
    $data = db("SELECT f.follow AS id, u.name, u.username, u.profile_picture, (SELECT COUNT(*) FROM `follows` AS f WHERE f.follow = u.id AND f.user = {$values['user']}) is_following FROM `follows` as f INNER JOIN `users` AS u ON u.id = f.follow WHERE f.user = {$values['profile']};", true);
    
}





// Echo success and data
echo json_encode(array(
    "success" => true,
    "feed" => $values['feed'],
    "data" => $data
));


/*

Formatted SQL:

SELECT DISTINCT 
    mutual AS id, u.name, u.username, u.profile_picture,
    (SELECT COUNT(*) FROM `follows` AS f WHERE f.follow = u.id AND f.user = {$values['user']}) is_following
FROM 
    (
        SELECT `user` AS `mutual` FROM `follows` WHERE `follow` = {$values['profile']}
    ) AS F1
    INNER JOIN
    (
         SELECT `follow` AS `mutual` FROM `follows` WHERE `user` = {$values['user']}
    ) AS F2
    USING(`mutual`)
    
    INNER JOIN `users` AS u
    	ON u.id = mutual
    
    
    
    
SELECT
    f.user AS id, u.name, u.username, u.profile_picture,
    (SELECT COUNT(*) FROM `follows` AS f WHERE f.follow = u.id AND f.user = {$values['user']}) is_following
FROM 
    `follows` as f
INNER JOIN `users` AS u
    ON u.id = f.user
WHERE 
    f.follow = {$values['profile']}




SELECT
    f.follow AS id, u.name, u.username, u.profile_picture,
    (SELECT COUNT(*) FROM `follows` AS f WHERE f.follow = u.id AND f.user = {$values['user']}) is_following
FROM 
    `follows` as f
INNER JOIN `users` AS u
    ON u.id = f.follow
WHERE 
    f.user = {$values['profile']}


*/