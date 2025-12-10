-- Insert Admin User
-- Email: hotel@gmail.com
-- Password: 1234567890

INSERT INTO users (name, email, password, role, created_at) 
VALUES (
  'Admin', 
  'hotel@gmail.com', 
  '$2b$10$6vXVB990qXZauxJvnNqD8uvfPDUVV72Vk5UIBqg8Fy9DPIKU1mh7G',
  'ADMIN', 
  NOW()
);