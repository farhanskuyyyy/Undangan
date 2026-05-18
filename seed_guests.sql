-- SQL to insert 10 sample guests
insert into guests (name, qr_code, attendance_count)
values 
  ('Ahmad Fauzi', 'GUEST-001', 2),
  ('Siti Aminah', 'GUEST-002', 2),
  ('Budi Santoso', 'GUEST-003', 1),
  ('Dewi Lestari', 'GUEST-004', 2),
  ('Rizky Pratama', 'GUEST-005', 1),
  ('Putri Handayani', 'GUEST-006', 2),
  ('Eko Prasetyo', 'GUEST-007', 1),
  ('Lani Wijaya', 'GUEST-008', 2),
  ('Aditya Nugraha', 'GUEST-009', 1),
  ('Maya Indah', 'GUEST-010', 2);

-- Note: qr_code ini yang dipakai di URL parameter (?to=GUEST-001)
