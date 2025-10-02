-- Add user_id column to alerts table for user-scoped access
ALTER TABLE public.alerts 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX idx_alerts_user_id ON public.alerts(user_id);

-- Add user_id column to pattern_detections table
ALTER TABLE public.pattern_detections 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX idx_pattern_detections_user_id ON public.pattern_detections(user_id);

-- Enable RLS on alerts table
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Enable RLS on pattern_detections table
ALTER TABLE public.pattern_detections ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can manage all alerts (for Flask backend)
CREATE POLICY "Service role can manage all alerts"
ON public.alerts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy: Authenticated users can view their own alerts
CREATE POLICY "Users can view their own alerts"
ON public.alerts
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Authenticated users can insert their own alerts
CREATE POLICY "Users can insert their own alerts"
ON public.alerts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Authenticated users can update their own alerts
CREATE POLICY "Users can update their own alerts"
ON public.alerts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Authenticated users can delete their own alerts
CREATE POLICY "Users can delete their own alerts"
ON public.alerts
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Service role can manage all pattern detections (for Flask backend)
CREATE POLICY "Service role can manage all pattern detections"
ON public.pattern_detections
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy: Authenticated users can view their own pattern detections
CREATE POLICY "Users can view their own pattern detections"
ON public.pattern_detections
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Authenticated users can insert their own pattern detections
CREATE POLICY "Users can insert their own pattern detections"
ON public.pattern_detections
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Authenticated users can update their own pattern detections
CREATE POLICY "Users can update their own pattern detections"
ON public.pattern_detections
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Authenticated users can delete their own pattern detections
CREATE POLICY "Users can delete their own pattern detections"
ON public.pattern_detections
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add comment explaining the security model
COMMENT ON TABLE public.alerts IS 'Trading alerts with RLS enabled. Each alert is scoped to a user. Service role (Flask backend) can manage all alerts.';
COMMENT ON TABLE public.pattern_detections IS 'Pattern detection data with RLS enabled. Each detection is scoped to a user. Service role (Flask backend) can manage all detections.';