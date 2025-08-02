-- Check user posts and scores
SELECT 
    id,
    title,
    content,
    score,
    created_at,
    post_type
FROM posts 
WHERE user_id = '13df7bf1-d38f-4b58-b444-3dfa67e04f17' 
ORDER BY created_at DESC 
LIMIT 10;

-- Check weekly points data
SELECT * FROM weekly_points 
WHERE user_id = '13df7bf1-d38f-4b58-b444-3dfa67e04f17';

-- Check what the latest post function returns
SELECT 
    id,
    title,
    content,
    COALESCE(score, 0) as score,
    created_at
FROM posts 
WHERE user_id = '13df7bf1-d38f-4b58-b444-3dfa67e04f17' 
ORDER BY created_at DESC 
LIMIT 1;
