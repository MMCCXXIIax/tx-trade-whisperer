-- UPDATED SUPABASE SQL: Optimized for profile removal while maintaining compatibility
-- 0) Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;

-- 1) PROFILES: Make profiles table optional - users can exist without profiles
-- This allows bypassing profile creation while maintaining backward compatibility
DROP POLICY IF EXISTS "service_role_manage_profiles" ON public.profiles;
DROP POLICY IF EXISTS "users_can_read_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_can_create_own_profile" ON public.profiles;

-- Allow service role full access
CREATE POLICY "service_role_manage_profiles"
  ON public.profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to read/create their own profiles (optional)
CREATE POLICY "users_can_read_own_profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_can_create_own_profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2) DETECTIONS: Allow full access for authenticated users
DROP POLICY IF EXISTS "service_role_manage_detections" ON public.detections;
DROP POLICY IF EXISTS "users_can_manage_detections" ON public.detections;

CREATE POLICY "service_role_manage_detections"
  ON public.detections
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "users_can_manage_detections"
  ON public.detections
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- 3) ERROR LOGS: Allow full access
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_manage_error_logs" ON public.error_logs;
CREATE POLICY "service_role_manage_error_logs"
  ON public.error_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4) USERS: Allow authenticated users to manage their own records
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_manage_users" ON public.users;
DROP POLICY IF EXISTS "users_can_read_own_user" ON public.users;

CREATE POLICY "service_role_manage_users"
  ON public.users
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "users_can_read_own_user"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- 5) SECURITY AUDIT LOG: Allow full access
DROP POLICY IF EXISTS "service_role_manage_audit_logs" ON public.security_audit_log;
CREATE POLICY "service_role_manage_audit_logs"
  ON public.security_audit_log
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6) VISITORS: Anonymize IP on insert/update (unchanged)
CREATE OR REPLACE FUNCTION public.hash_ip(ip_address TEXT)
RETURNS TEXT AS $$
BEGIN
    IF ip_address IS NULL THEN
        RETURN NULL;
    END IF;
    BEGIN
        RETURN encode(
            pg_catalog.digest( (ip_address || 'salt_for_privacy_protection')::bytea, 'sha256'::text),
            'hex'
        );
    EXCEPTION
        WHEN undefined_function THEN
            -- Fallback if pgcrypto is missing
            RETURN md5(ip_address || 'salt_for_privacy_protection');
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.visitors_anonymize()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.ip IS NOT NULL THEN
      NEW.ip_hash := public.hash_ip(NEW.ip);
      NEW.ip := NULL;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.ip IS DISTINCT FROM OLD.ip AND NEW.ip IS NOT NULL THEN
      NEW.ip_hash := public.hash_ip(NEW.ip);
      NEW.ip := NULL;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS visitors_anonymize_bi ON public.visitors;
DROP TRIGGER IF EXISTS visitors_anonymize_bu ON public.visitors;

CREATE TRIGGER visitors_anonymize_bi
  BEFORE INSERT ON public.visitors
  FOR EACH ROW
  EXECUTE FUNCTION public.visitors_anonymize();

CREATE TRIGGER visitors_anonymize_bu
  BEFORE UPDATE ON public.visitors
  FOR EACH ROW
  EXECUTE FUNCTION public.visitors_anonymize();

-- 7) PROFILES: Allow 'live' in mode; standardize email to citext
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_mode_check'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles DROP CONSTRAINT profiles_mode_check;
  END IF;
END $$;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_mode_check
CHECK (mode IN ('demo', 'live'));

-- Make email column optional and use citext
ALTER TABLE public.profiles
ALTER COLUMN email TYPE citext USING email::text::citext,
ALTER COLUMN email DROP NOT NULL;

-- Make name column optional too
ALTER TABLE public.profiles
ALTER COLUMN name DROP NOT NULL;

-- 8) UPDATED: Create function to auto-create user record on auth signup
-- This ensures users table has a record even without profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id)
  VALUES (new.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create user record
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9) TEST DATA: Seed into BOTH auth.users and public.users before profiles/visitors
INSERT INTO auth.users (id, email)
VALUES ('56047c1b-2f56-4a18-b215-6a19a0dcebda', 'test@example.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id)
VALUES ('56047c1b-2f56-4a18-b215-6a19a0dcebda')
ON CONFLICT (id) DO NOTHING;

-- Profile creation is now optional - users can access TX without profiles
INSERT INTO public.profiles (id, username, name, email, mode)
VALUES (
  '56047c1b-2f56-4a18-b215-6a19a0dcebda',
  'testuser',
  'Test User',
  'test@example.com',
  'live'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.visitors (id, ip, name, email, mode)
VALUES (
  '56047c1b-2f56-4a18-b215-6a19a0dcebda',
  '192.168.1.1',
  'Test User',
  'test@example.com',
  'live'
)
ON CONFLICT (id) DO NOTHING;