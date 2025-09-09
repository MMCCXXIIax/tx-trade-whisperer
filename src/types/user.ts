export interface User {
  id: string;
  email?: string;
  app_metadata?: any;
  user_metadata?: any;
  aud?: string;
  created_at?: string;
  last_sign_in_at?: string;
}