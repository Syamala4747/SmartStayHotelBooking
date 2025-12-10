-- Create Admin User
-- Email: hotel@gmail.com
-- Password: 1234567890

INSERT INTO users (name, email, password, role, created_at) 
VALUES (
  'Admin', 
  'hotel@gmail.com', 
  '$2b$10$YQZJZxwW5fO5h5h5h5h5hOK5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K',
  'ADMIN', 
  NOW()
)
ON CONFLICT (email) DO NOTHING;