import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://scniicwahrgbahtpakkf.supabase.co';
const supabaseAnonKey = 'sb_publishable_HqRPGJ3p2k7bE91bOHN-hQ_b0BoLp8o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);