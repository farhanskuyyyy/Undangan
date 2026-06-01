-- Ubah default constraint rsvp_status menjadi NULL
ALTER TABLE guests ALTER COLUMN rsvp_status SET DEFAULT NULL;

-- Rapikan data lama yang belum konfirmasi (message kosong dan belum check-in) ke NULL
UPDATE guests 
SET rsvp_status = NULL 
WHERE rsvp_status = false 
  AND message IS NULL 
  AND has_arrived = false;
