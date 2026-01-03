-- Add the week for Monday, December 29, 2025 (current week)
INSERT INTO weeks (week_start_date, pitch_name, pitch_address, pitch_maps_url, lock_time, status)
VALUES (
  '2025-12-29', -- The Monday of the current week
  'NL Arena',
  'Nong Hoi, Mueang Chiang Mai District, Chiang Mai 50000, Thailand',
  'https://maps.google.com/?q=NL+Arena+Chiang+Mai',
  '2025-12-28 20:00:00+07', -- Sunday 8:00 PM ICT (lock time - already passed)
  'open'
)
ON CONFLICT (week_start_date) DO NOTHING;
