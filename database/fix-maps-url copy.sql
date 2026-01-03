-- Fix Google Maps embed URL
-- Run this in your Supabase SQL Editor

UPDATE weeks
SET pitch_maps_url = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3778.770784950108!2d98.9905848!3d18.7190775!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30da31b87d135f17%3A0xa40182cabd0422a7!2sNL%20ARENA!5e0!3m2!1sen!2sth!4v1767344450707!5m2!1sen!2sth'
WHERE week_start_date = '2026-01-05';
