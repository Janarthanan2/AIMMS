-- SQL Script to remove AUTO_INCREMENT from app_users table
-- This allows manual ID management for sequential IDs without gaps

-- Step 1: Remove AUTO_INCREMENT from user_id column
ALTER TABLE app_users MODIFY COLUMN user_id BIGINT NOT NULL;

-- Step 2: If you want to reset the sequence and fill gaps, you can optionally:
-- (Only run this if you want to renumber all existing users)
-- SET @new_id = 0;
-- UPDATE app_users SET user_id = (@new_id := @new_id + 1) ORDER BY user_id;

-- Verify the change
DESCRIBE app_users;
