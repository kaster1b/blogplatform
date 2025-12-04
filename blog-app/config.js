// Supabase Configuration
// Replace these with your Supabase project credentials
// Get these from: https://supabase.com/dashboard/settings/api

const SUPABASE_URL = 'https://lglcjggtensgwrbhzvaz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnbGNqZ2d0ZW5zZ3dyYmh6dmF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4Mjg5MjEsImV4cCI6MjA4MDQwNDkyMX0.DTQgozQRrUCGNrpti7RG_MMDjMLqckfq2ljjUeubIRA';

// Get current page URL for redirect
const getCurrentURL = () => {
    return window.location.origin + window.location.pathname;
};

// Import Supabase library
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.0';
script.onload = function() {
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
};
document.head.appendChild(script);
