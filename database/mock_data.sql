-- Insert mock quotes (more comprehensive data)
INSERT INTO quotes (text, author, category, tags) VALUES
-- Philosophy & Stoicism
('The happiness of your life depends upon the quality of your thoughts.', 'Marcus Aurelius', 'Philosophy', ARRAY['#Stoicism', '#Wisdom', '#Mindfulness']),
('It is during our darkest moments that we must focus to see the light.', 'Aristotle', 'Philosophy', ARRAY['#Resilience', '#Hope', '#Philosophy']),
('The impediment to action advances action. What stands in the way becomes the way.', 'Marcus Aurelius', 'Philosophy', ARRAY['#Stoicism', '#Action', '#Philosophy']),
('We suffer more often in imagination than in reality.', 'Seneca', 'Philosophy', ARRAY['#Stoicism', '#Mindfulness', '#Philosophy']),
('The only way to deal with an unfree world is to become so absolutely free that your very existence is an act of rebellion.', 'Albert Camus', 'Philosophy', ARRAY['#Freedom', '#Philosophy', '#Resilience']),

-- Inspiration & Motivation
('I''ve learned that people will forget what you said, but people will never forget how you made them feel.', 'Maya Angelou', 'Inspiration', ARRAY['#Empathy', '#Relationships', '#Leadership']),
('The future belongs to those who believe in the beauty of their dreams.', 'Eleanor Roosevelt', 'Inspiration', ARRAY['#Dreams', '#Future', '#Motivation']),
('The only impossible journey is the one you never begin.', 'Tony Robbins', 'Motivation', ARRAY['#Action', '#Courage', '#Leadership']),
('In the middle of difficulty lies opportunity.', 'Albert Einstein', 'Wisdom', ARRAY['#Opportunity', '#Growth', '#Resilience']),
('The only way to do great work is to love what you do.', 'Steve Jobs', 'Business', ARRAY['#Passion', '#Success', '#Leadership']),

-- Humor
('I haven''t slept for ten days, because that would be too long.', 'Mitch Hedberg', 'Humor', ARRAY['#Surreal', '#Witty', '#Humor']),
('My fake plants died because I did not pretend to water them.', 'Mitch Hedberg', 'Humor', ARRAY['#Surreal', '#Witty', '#Humor']),
('I''m on a seafood diet. I see food and I eat it.', 'Anonymous', 'Humor', ARRAY['#Punny', '#Food', '#Humor']),
('Everything is funny, as long as it''s happening to somebody else.', 'Will Rogers', 'Humor', ARRAY['#Witty', '#Life', '#Humor']),
('I told my wife she was drawing her eyebrows too high. She looked surprised.', 'Rodney Dangerfield', 'Humor', ARRAY['#Punny', '#Witty', '#Humor']),

-- Wisdom & Life
('If you think you are too small to make a difference, try sleeping with a mosquito.', 'Dalai Lama', 'Wisdom', ARRAY['#Impact', '#Perspective', '#Nature']),
('Life is what happens to you while you''re busy making other plans.', 'John Lennon', 'Life', ARRAY['#Present', '#Mindfulness', '#Nature']),
('Be yourself; everyone else is already taken.', 'Oscar Wilde', 'Life', ARRAY['#Authenticity', '#Self', '#Leadership']),
('The two most important days in your life are the day you are born and the day you find out why.', 'Mark Twain', 'Life', ARRAY['#Purpose', '#Wisdom', '#Motivation']),
('In three words I can sum up everything I''ve learned about life: it goes on.', 'Robert Frost', 'Life', ARRAY['#Resilience', '#Nature', '#Wisdom']),

-- Science & Innovation
('Imagination is more important than knowledge.', 'Albert Einstein', 'Science', ARRAY['#Creativity', '#Innovation', '#Leadership']),
('The important thing is not to stop questioning.', 'Albert Einstein', 'Science', ARRAY['#Curiosity', '#Growth', '#Philosophy']),
('Science is a way of thinking much more than it is a body of knowledge.', 'Carl Sagan', 'Science', ARRAY['#Philosophy', '#Innovation', '#Growth']),

-- Rumi Quotes
('The wound is the place where the Light enters you.', 'Rumi', 'Spirituality', ARRAY['#Growth', '#Resilience', '#Nature']),
('Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.', 'Rumi', 'Spirituality', ARRAY['#Wisdom', '#Growth', '#Mindfulness']),
('Let yourself be silently drawn by the strange pull of what you really love. It will not lead you astray.', 'Rumi', 'Spirituality', ARRAY['#Purpose', '#Nature', '#Motivation']);

-- Note: Collections and favorites will be created by users through the app
-- To insert mock data for a specific user, replace 'USER_ID_HERE' with actual user UUID:

-- Example: Insert mock collections for a user
-- INSERT INTO collections (user_id, name, icon, color) VALUES
-- ('USER_ID_HERE', 'Morning Motivation', '☀️', '#0F766E'),
-- ('USER_ID_HERE', 'Stoic Philosophy', '📜', '#059669'),
-- ('USER_ID_HERE', 'Growth Mindset', '⭐', '#047857'),
-- ('USER_ID_HERE', 'Nature & Earth', '🌳', '#065F46'),
-- ('USER_ID_HERE', 'Work Inspiration', '💼', '#064E3B');

-- Example: Insert mock favorites for a user
-- INSERT INTO favorites (user_id, quote_id, quote_text, quote_author) 
-- SELECT 
--     'USER_ID_HERE',
--     id,
--     text,
--     author
-- FROM quotes
-- WHERE id IN (
--     SELECT id FROM quotes ORDER BY RANDOM() LIMIT 5
-- );

-- Example: Add quotes to a collection
-- INSERT INTO collection_quotes (collection_id, quote_id, quote_text, quote_author)
-- SELECT 
--     (SELECT id FROM collections WHERE user_id = 'USER_ID_HERE' AND name = 'Morning Motivation' LIMIT 1),
--     id,
--     text,
--     author
-- FROM quotes
-- WHERE category = 'Inspiration'
-- LIMIT 5;
