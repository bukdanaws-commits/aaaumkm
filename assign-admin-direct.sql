-- Assign admin role to itarizvsn@gmail.com
-- User ID: 6f15b3c4-2ad2-4cd8-af17-fc51e70bb673

-- Check if role already exists
SELECT * FROM user_roles WHERE "userId" = '6f15b3c4-2ad2-4cd8-af17-fc51e70bb673';

-- Insert admin role if not exists
INSERT INTO user_roles (id, "userId", role, "createdAt", "updatedAt")
VALUES (
  'admin_' || gen_random_uuid()::text,
  '6f15b3c4-2ad2-4cd8-af17-fc51e70bb673',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- Verify
SELECT * FROM user_roles WHERE "userId" = '6f15b3c4-2ad2-4cd8-af17-fc51e70bb673';
