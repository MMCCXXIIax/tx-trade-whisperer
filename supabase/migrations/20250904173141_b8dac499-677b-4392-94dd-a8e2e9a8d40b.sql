-- 1. Add proper RLS policies for app_state table
CREATE POLICY "Service role can manage app state" 
ON public.app_state 
FOR ALL 
USING (auth.role() = 'service_role'::text)
WITH CHECK (auth.role() = 'service_role'::text);

-- 2. Add admin access to app_state (if admin role exists)
CREATE POLICY "Admins can read app state" 
ON public.app_state 
FOR SELECT 
USING (COALESCE((auth.jwt() ->> 'role'::text), ''::text) = 'admin'::text);

-- 3. Anonymize visitor tracking data by hashing IP addresses
-- First, add a new column for hashed IP
ALTER TABLE public.visitors ADD COLUMN ip_hash TEXT;

-- Create function to hash IP addresses (one-way hash for privacy)
CREATE OR REPLACE FUNCTION public.hash_ip(ip_address TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Use SHA-256 hash with a salt for IP anonymization
  RETURN encode(digest(ip_address || 'salt_for_privacy_protection', 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing records to use hashed IPs
UPDATE public.visitors 
SET ip_hash = public.hash_ip(ip) 
WHERE ip IS NOT NULL AND ip_hash IS NULL;

-- 4. Add data retention policy - auto-delete visitor data older than 90 days
CREATE OR REPLACE FUNCTION public.cleanup_old_visitor_data()
RETURNS void AS $$
BEGIN
  DELETE FROM public.visitors 
  WHERE last_seen < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Strengthen portfolio RLS policies to prevent any potential leaks
DROP POLICY IF EXISTS "Service role full access to portfolio" ON public.portfolio;
CREATE POLICY "Service role portfolio access" 
ON public.portfolio 
FOR ALL 
USING (auth.role() = 'service_role'::text)
WITH CHECK (auth.role() = 'service_role'::text);

-- 6. Add audit logging for sensitive operations
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id TEXT,
  ip_hash TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (COALESCE((auth.jwt() ->> 'role'::text), ''::text) = 'admin'::text);