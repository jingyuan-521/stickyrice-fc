-- Fix Google Maps URL to use embed-compatible format
UPDATE weeks
SET pitch_maps_url = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3777.2!2d98.9!3d18.8!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTjCsDQ4JzAwLjAiTiA5OMKwNTQnMDAuMCJF!5e0!3m2!1sen!2sth!4v1234567890'
WHERE week_start_date = '2026-01-05';
