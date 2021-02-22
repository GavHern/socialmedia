<?php

/*

Parameters for this file: q (the search query)

*/



// Requires (header information, database functions, authentication functions, utility functions)
include 'tools/headers.php';
include 'tools/db.php';
include 'tools/auth.php';
include 'tools/utils.php';


// Get all nessisary parameters and sanitize them
$values = array(
    "user" => get_session(),
    "query" => sanitize($_GET['q'])
);

// Get users that match the query
$users = db("SELECT `id`, `name`, `username`, `profile_picture`, (SELECT COUNT(*) FROM `follows` WHERE follow = u.id) followers, (SELECT COUNT(*) FROM `follows` AS f WHERE f.follow = u.id AND f.user = {$values['user']}) is_following, u.`timestamp` FROM `users` AS u WHERE LOWER(`username`) LIKE LOWER('%{$values['query']}%') OR LOWER(`name`) LIKE LOWER('%{$values['query']}%') ORDER BY `timestamp` ASC LIMIT 50;", true);




// Echo query results
echo json_encode(array(
    "success" => true,
    "query" => $values['query'],
    "users" => $users
));

/*

FORMATTED SQL



SELECT
    `id`, `name`, `username`, `profile_picture`,
    (SELECT COUNT(*) FROM `follows` WHERE follow = u.id) followers,
    (SELECT COUNT(*) FROM `follows` AS f WHERE f.follow = u.id AND f.user = {$values['user']}) is_following,
	u.`timestamp`
FROM
    `users` AS u
WHERE
    LOWER(`username`) LIKE LOWER('%{$values['query']}%') OR LOWER(`name`) LIKE LOWER('%{$values['query']}%')
ORDER BY
    `timestamp` ASC
LIMIT 50


*/