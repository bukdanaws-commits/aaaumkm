-- Assign admin role to itarizvsn@gmail.com

-- First, find the user ID
SELECT id, email, name FROM users WHERE email = 'itarizvsn@gmail.com';

-- Insert admin role (replace USER_ID_HERE with the actual ID from above query)
-- INSERT INTO user_roles (id, "userId", role, "createdAt", "updatedAt") 
-- VALUES (
--   'admin_role_' || gen_random_uuid()::text,
--   'USER_ID_HERE',
--   'admin',
--   NOW(),
--   NOW()
-- );

-- Or use this to auto-assign:
INSERT INTO user_roles (id, "userId", role, "createdAt", "updatedAt")
SELECT 
  'admin_role_' || gen_random_uuid()::text,
  id,
  'admin',
  NOW(),
  NOW()
FROM users 
WHERE email = 'itarizvsn@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM user_roles 
  WHERE "userId" = users.id AND role = 'admin'
);

-- Verify
SELECT u.email, ur.role 
FROM users u
LEFT JOIN user_roles ur ON u.id = ur."userId"
WHERE u.email = 'itarizvsn@gmail.com';
