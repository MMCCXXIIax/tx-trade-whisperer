-- Fix security issues (proper syntax)

-- 1. Remove overly permissive policy from detections
DROP POLICY IF EXISTS "Authenticated can view detections" ON public.detections;

-- 2. Create app_role enum if not exists
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 5. RLS policies for user_roles
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage roles"
ON public.user_roles FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- 6. Add onboarding tracking to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_step integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_login timestamp with time zone;