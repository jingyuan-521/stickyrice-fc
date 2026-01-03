-- Add this week's game (Monday, January 5, 2026)
INSERT INTO weeks (week_start_date, pitch_name, pitch_address, pitch_maps_url, lock_time, status)
VALUES (
  '2026-01-05', -- This Monday
  'NL Arena',
  'Nong Hoi, Mueang Chiang Mai District, Chiang Mai 50000, Thailand',
  'https://maps.google.com/?q=NL+Arena+Chiang+Mai',
  '2026-01-05 12:00:00+07', -- Sunday 8:00 PM ICT (lock time)
  'open'
)
ON CONFLICT (week_start_date) DO NOTHING;
