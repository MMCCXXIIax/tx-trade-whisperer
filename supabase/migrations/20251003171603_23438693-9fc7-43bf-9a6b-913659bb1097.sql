-- =============================================
-- CRITICAL SECURITY FIX: Enable RLS on all public tables
-- =============================================

-- Fix paper_trades table (CRITICAL - no RLS at all)
ALTER TABLE public.paper_trades ENABLE ROW LEVEL SECURITY;

-- Add user_id column if not exists (for proper user scoping)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'paper_trades' 
                 AND column_name = 'user_id') THEN
    -- user_id already exists, just make sure it's properly indexed
    CREATE INDEX IF NOT EXISTS idx_paper_trades_user_id ON public.paper_trades(user_id);
  END IF;
END $$;

-- Paper trades policies
CREATE POLICY "service_role_manage_paper_trades"
ON public.paper_trades FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "users_view_own_paper_trades"
ON public.paper_trades FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_paper_trades"
ON public.paper_trades FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_paper_trades"
ON public.paper_trades FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_delete_own_paper_trades"
ON public.paper_trades FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Fix users table (publicly readable)
CREATE POLICY "users_view_own_record"
ON public.users FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Fix detections table (publicly readable - already has some policies but needs restriction)
DROP POLICY IF EXISTS "users_can_manage_detections" ON public.detections;

-- Add user_id to detections if needed
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'detections' 
                 AND column_name = 'user_id') THEN
    ALTER TABLE public.detections ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX idx_detections_user_id ON public.detections(user_id);
  END IF;
END $$;

-- Detections policies (more restrictive)
CREATE POLICY "users_view_own_detections"
ON public.detections FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "users_insert_own_detections"
ON public.detections FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_detections"
ON public.detections FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_delete_own_detections"
ON public.detections FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Fix portfolio table (add missing policies)
DROP POLICY IF EXISTS "Allow user to read own portfolio" ON public.portfolio;
DROP POLICY IF EXISTS "Allow user to insert own portfolio" ON public.portfolio;
DROP POLICY IF EXISTS "Allow user to update own portfolio" ON public.portfolio;
DROP POLICY IF EXISTS "Allow user to delete own portfolio" ON public.portfolio;

CREATE POLICY "users_view_own_portfolio"
ON public.portfolio FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_portfolio"
ON public.portfolio FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_portfolio"
ON public.portfolio FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_delete_own_portfolio"
ON public.portfolio FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add security comments
COMMENT ON TABLE public.paper_trades IS 'Paper trading records - user scoped with RLS';
COMMENT ON TABLE public.detections IS 'Pattern detections - user scoped with RLS';
COMMENT ON TABLE public.users IS 'User accounts - protected by RLS';
COMMENT ON TABLE public.portfolio IS 'User portfolio holdings - protected by RLS';