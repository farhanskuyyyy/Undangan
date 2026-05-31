-- Add arrival status to guests
ALTER TABLE guests ADD COLUMN has_arrived BOOLEAN DEFAULT FALSE;
ALTER TABLE guests ADD COLUMN arrival_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE guests ADD COLUMN is_vip BOOLEAN DEFAULT FALSE;

-- Table for main wedding settings
CREATE TABLE wedding_settings (
  id SERIAL PRIMARY KEY,
  groom_name TEXT,
  bride_name TEXT,
  wedding_date TIMESTAMP WITH TIME ZONE,
  location_name TEXT,
  location_address TEXT,
  maps_url TEXT
);

-- Table for Love Story
CREATE TABLE love_stories (
  id SERIAL PRIMARY KEY,
  event_date TEXT,
  title TEXT,
  description TEXT,
  image_url TEXT,
  order_index INTEGER
);

-- Table for Gallery
CREATE TABLE galleries (
  id SERIAL PRIMARY KEY,
  image_url TEXT,
  aspect_ratio TEXT,
  order_index INTEGER
);

-- Insert initial dummy data
INSERT INTO wedding_settings (groom_name, bride_name, wedding_date, location_name, location_address, maps_url)
VALUES ('John', 'Jane', '2026-05-19T10:00:00Z', 'National Monument (Monas)', 'Jakarta', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.666427145322!2d106.82457877586522!3d-6.175392393811883!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f5d2e764b12d%3A0x3d2ad23d044066c!2sNational%20Monument!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid');

INSERT INTO love_stories (event_date, title, description, image_url, order_index)
VALUES 
('August 2021', 'First Meet', 'Chance encounter in Jakarta.', '/contoh1.JPG', 1),
('October 2021', 'First Date', 'Sunset dinner.', '/contoh1.JPG', 2),
('December 2024', 'The Proposal', 'Under the starlit sky.', '/contoh1.JPG', 3),
('May 19, 2026', 'Wedding Day', 'The beginning of our forever.', '/contoh1.JPG', 4);

INSERT INTO galleries (image_url, aspect_ratio, order_index)
VALUES 
('/contoh1.JPG', 'aspect-square', 1),
('/contoh1.JPG', 'aspect-video', 2),
('/contoh1.JPG', 'aspect-[3/4]', 3),
('/contoh1.JPG', 'aspect-[4/3]', 4),
('/contoh1.JPG', 'aspect-square', 5),
('/contoh1.JPG', 'aspect-video', 6),
('/contoh1.JPG', 'aspect-[3/4]', 7),
('/contoh1.JPG', 'aspect-[4/3]', 8);

-- Table for event rundown
CREATE TABLE rundowns (
  id SERIAL PRIMARY KEY,
  time_start TEXT,
  time_end TEXT,
  title TEXT,
  description TEXT,
  order_index INTEGER
);

-- Insert initial rundown data
INSERT INTO rundowns (time_start, time_end, title, description, order_index)
VALUES 
('08:00', '10:00', 'Akad Nikah', 'Prosesi ijab qabul dan doa bersama.', 1),
('11:00', '13:00', 'Resepsi', 'Ramah tamah dan jamuan makan siang.', 2);

-- Enable RLS on tables
ALTER TABLE wedding_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE rundowns ENABLE ROW LEVEL SECURITY;

-- Create public select policies
CREATE POLICY "Allow public select on wedding_settings" ON wedding_settings FOR SELECT USING (true);
CREATE POLICY "Allow public select on love_stories" ON love_stories FOR SELECT USING (true);
CREATE POLICY "Allow public select on galleries" ON galleries FOR SELECT USING (true);
CREATE POLICY "Allow public select on rundowns" ON rundowns FOR SELECT USING (true);

-- Add photo_url to guests table
ALTER TABLE guests ADD COLUMN photo_url TEXT;

-- Add wishes column to guests table (filled at check-in, shown on projector)
ALTER TABLE guests ADD COLUMN wishes TEXT;

