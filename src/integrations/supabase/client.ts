// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://oqnqujpkmailxxsbegdg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xbnF1anBrbWFpbHh4c2JlZ2RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNDEyMjcsImV4cCI6MjA2NTcxNzIyN30.uN6dWDydTE5rmuxetECFo_I2DF_54DbaJYnf0qgMZHM";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);