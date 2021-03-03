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
    "user" => get_session(),
    "timestamp" => time() // Get current timestamp
);


$data = db("SELECT * FROM( SELECT 'follow' AS type, u.name AS data, '' AS meta, f.user AS link, f.timestamp AS timestamp FROM follows AS f INNER JOIN users AS u ON f.user = u.id WHERE follow = {$values['user']} UNION ALL SELECT 'post_like' AS type, u.name AS data, '' AS meta, l.id AS link, l.timestamp AS timestamp FROM likes AS l INNER JOIN posts AS p ON l.id = p.id INNER JOIN users AS u ON l.user = u.id WHERE p.author = {$values['user']} AND l.user != {$values['user']} AND is_comment = 0 UNION ALL SELECT 'comment_like' AS type, u.name AS data, '' AS meta, l.id AS link, l.timestamp AS timestamp FROM likes AS l INNER JOIN comments AS c ON l.id = c.id INNER JOIN users AS u ON l.user = u.id WHERE c.author = {$values['user']} AND l.user != {$values['user']} AND is_comment = 1 UNION ALL SELECT 'comment' AS type, u.name AS data, c.body AS meta, c.parent AS link, c.timestamp AS timestamp FROM comments AS c INNER JOIN users AS u ON c.author = u.id INNER JOIN posts AS p ON p.id = c.parent WHERE p.author = {$values['user']} AND c.author != {$values['user']} UNION ALL SELECT 'post_mention' AS type, u.name AS data, p.body AS meta, p.id AS link, p.timestamp AS timestamp FROM posts AS p INNER JOIN users AS u ON p.author = u.id WHERE p.body LIKE '%<@{$values['user']}>%' AND p.author != {$values['user']} UNION ALL SELECT 'comment_mention' AS type, u.name AS data, c.body AS meta, c.parent AS link, c.timestamp AS timestamp FROM comments AS c INNER JOIN users AS u ON c.author = u.id WHERE c.body LIKE '%<@{$values['user']}>%' AND c.author != {$values['user']}) AS q ORDER BY timestamp DESC LIMIT 50 OFFSET 0", true);


// Parse all activity metadata posts for mentions
$iterator = 0;

foreach ($data as $i) {
    if($i['meta'] != ''){
        $data[$iterator]['meta'] = parseMentions($i['meta']);
    }
    
    $iterator++;
}




$time_frames = array(
    "day" => [],
    "week" => [],
    "all" => []
);


foreach ($data as $i) {
  if($values['timestamp'] - $i['timestamp'] <= 60*60*24){
    $time_frames['day'][] = $i;
  } else if ($values['timestamp'] - $i['timestamp'] <= 60*60*24*7){
    $time_frames['week'][] = $i;
  } else {
    $time_frames['all'][] = $i;
  }
}


// Echo new account information
echo json_encode(array(
    "success" => true,
    "data" => $time_frames
));


/*


FORMATTED SQL




SELECT * FROM (

    -- Get followers;
    SELECT
        'follow' AS type,
        u.name AS data,
        '' AS meta,
        f.user AS link,
        f.timestamp AS timestamp
    FROM 
        follows AS f
        INNER JOIN users AS u
        ON f.user = u.id
    WHERE follow = {$values['user']}


    UNION ALL

    -- Get post likes;
    SELECT
        'post_like' AS type,
        u.name AS data,
        '' AS meta,
        l.id AS link,
        l.timestamp AS timestamp
    FROM 
        likes AS l
        INNER JOIN posts AS p
        ON l.id = p.id
        INNER JOIN users AS u
        ON l.user = u.id
    WHERE p.author = {$values['user']} AND l.user != {$values['user']} AND is_comment = 0
    
    
    UNION ALL 
    
    -- Get comment likes;
    SELECT
        'comment_like' AS type,
        u.name AS data,
        '' AS meta,
        l.id AS link,
        l.timestamp AS timestamp
    FROM 
        likes AS l
        INNER JOIN comments AS c
        ON l.id = c.id
        INNER JOIN users AS u
        ON l.user = u.id
    WHERE c.author = {$values['user']} AND l.user != {$values['user']} AND is_comment = 1


    UNION ALL

    -- Get comments;
    SELECT
        'comment' AS type,
        u.name AS data,
        c.body AS meta,
        c.parent AS link,
        c.timestamp AS timestamp
    FROM 
        comments AS c
        INNER JOIN users AS u
        ON c.author = u.id
        INNER JOIN posts AS p
        ON p.id = c.parent
    WHERE p.author = {$values['user']} AND c.author != {$values['user']}
    
    UNION ALL

    -- Get post mentions;
    SELECT
        'post_mention' AS type,
        u.name AS data,
        p.body AS meta,
        p.id AS link,
        p.timestamp AS timestamp
    FROM 
        posts AS p
        INNER JOIN users AS u
        ON p.author = u.id
    WHERE p.body LIKE '%<@{$values['user']}>%' AND p.author != {$values['user']}
    
    UNION ALL
    
    -- Get comment mentions;
    SELECT
        'comment_mention' AS type,
        u.name AS data,
        c.body AS meta,
        c.parent AS link,
        c.timestamp AS timestamp
    FROM 
        comments AS c
        INNER JOIN users AS u
        ON c.author = u.id
    WHERE c.body LIKE '%<@{$values['user']}>%' AND c.author != {$values['user']}
    

) AS q
ORDER BY timestamp DESC
LIMIT 50 OFFSET 0



*/