
-- Seed data for testing
-- First, create a company
INSERT INTO public.companies (id, name, country)
VALUES 
  ('d41e2c55-9a34-4abd-95db-b3db7eb9fb3b', 'TimeTrack Technologies Ltd.', 'United Kingdom'),
  ('8aa6f84e-ff6d-4366-a6c6-bc11989e33ab', 'TimeTrack Software Pvt Ltd', 'India');

-- Create admin and hr users directly in the supabase dashboard first with:
-- admin@example.com / password
-- hr@example.com / password

-- Then update these users' profiles to give them proper roles
-- Note: You will need to replace the UUIDs with actual values from your auth.users table
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'admin-user-id-here';
-- UPDATE public.profiles SET role = 'hr' WHERE id = 'hr-user-id-here';
-- UPDATE public.profiles SET first_name = 'Admin', last_name = 'User' WHERE id = 'admin-user-id-here';
-- UPDATE public.profiles SET first_name = 'HR', last_name = 'Manager' WHERE id = 'hr-user-id-here';
