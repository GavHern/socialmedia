<?php



// Requires (header information, database functions, authentication functions, utility functions)
include 'tools/headers.php';
include 'tools/db.php';
include 'tools/auth.php';
include 'tools/utils.php';


// Get all nessisary parameters and sanitize them
$values = array(
    "user" => get_session()
);


$recent = db("SELECT v.page, v.data AS id, u.name, u.username, u.profile_picture, MAX(v.timestamp) AS timestamp FROM `visits` AS v INNER JOIN `users` AS u ON v.data = u.id WHERE v.page = 'profile' AND v.user = {$values['user']} GROUP BY id ORDER BY timestamp DESC", true);


$following = db("SELECT f.follow AS id, u.name, u.username, u.profile_picture, '1' AS is_following FROM `follows` AS f INNER JOIN users AS u ON f.follow = u.id WHERE `user` = {$values['user']} ORDER BY u.username ASC;", true);



// Echo query results
echo json_encode(array(
    "success" => true,
    "recent" => $recent,
    "following" => $following
));


/*

FORMATTED SQL



Recent: 


SELECT
    v.page, v.data AS id, u.name, u.username, u.profile_picture, MAX(v.timestamp) AS timestamp
FROM
    `visits` AS v
    INNER JOIN `users` AS u
    ON v.data = u.id
WHERE v.page = 'profile' AND v.user = {$values['user']}
GROUP BY id
ORDER BY timestamp DESC





Following:


SELECT
    f.follow AS id, u.name, u.username, u.profile_picture, "1" AS is_following
FROM
    `follows` AS f
    INNER JOIN users AS u
    ON f.follow = u.id
WHERE
    `user` = {$values['user']}
ORDER BY u.username ASC


*/