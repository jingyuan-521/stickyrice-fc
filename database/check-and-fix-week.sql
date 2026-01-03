-- First, let's see what weeks we have
SELECT * FROM weeks ORDER BY week_start_date;

-- Delete the wrong date if it exists
DELETE FROM weeks WHERE week_start_date = '2026-01-06';

-- Insert the correct Monday (January 5, 2026) with the real Google Maps link
INSERT INTO weeks (week_start_date, pitch_name, pitch_address, pitch_maps_url, lock_time, status)
VALUES (
  '2026-01-05',
  'NL Arena',
  'Nong Hoi, Mueang Chiang Mai District, Chiang Mai 50000, Thailand',
  'https://maps.app.goo.gl/dZKZWrBXaa3JcXfy6',
  '2026-01-05 12:00:00+07',
  'open'
);
