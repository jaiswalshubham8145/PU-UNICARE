-- ========================================================================
-- Migration: 20261028000000_parul_university_campus_buildings.sql
-- Description: Replace fictitious hypothetical buildings with official,
-- verified Parul University campus blocks, food courts, hostels, hospitals & landmarks.
-- ========================================================================

-- Step 1: Temporarily clear existing building_id references if any
UPDATE public.complaints SET building_id = NULL WHERE building_id IS NOT NULL;

-- Step 2: Delete outdated/fictitious building records
DELETE FROM public.buildings;

-- Step 3: Insert authentic Parul University Campus Blocks & Facilities
INSERT INTO public.buildings (name, category) VALUES
-- Category 1: Academic Blocks (A-Series)
('A1 - Parul Institute of Engineering & Technology (PIET)', 'Academic Blocks (A-Series)'),
('A2 - PIET Diploma Studies & Administration', 'Academic Blocks (A-Series)'),
('A3 - PIET D-Block (Advanced Labs)', 'Academic Blocks (A-Series)'),
('A4 - Parul Institute of Pharmacy (PIP)', 'Academic Blocks (A-Series)'),
('A5 - PIET Diploma & Central Gymnasium', 'Academic Blocks (A-Series)'),
('A6 - Parul Institute of Nursing', 'Academic Blocks (A-Series)'),
('A7 - Jawaharlal Nehru Homoeopathic Medical College & Physiotherapy', 'Academic Blocks (A-Series)'),
('A8 - Parul Institute of Pharmacy & Research (PIPR)', 'Academic Blocks (A-Series)'),
('A9 - Parul Polytechnic Institute (PPI)', 'Academic Blocks (A-Series)'),
('A10 - School of Pharmacy', 'Academic Blocks (A-Series)'),
('A11 - Medical Library & Insights Support Centre', 'Academic Blocks (A-Series)'),
('A12 - Parul Institute of Medical Sciences & Research (PIMSR)', 'Academic Blocks (A-Series)'),
('A13 - Parul Institute of Ayurved', 'Academic Blocks (A-Series)'),
('A14 - Parul Institute of Business Administration (PIBA)', 'Academic Blocks (A-Series)'),
('A15 - Faculty of Management Studies (FMS) & Harmony Hall', 'Academic Blocks (A-Series)'),
('A16 - Parul Institute of Architecture & Design Research', 'Academic Blocks (A-Series)'),
('A17 - Parul Institute of Homoeopathy & Research (PIHR)', 'Academic Blocks (A-Series)'),
('A18 - Parul Institute of Ayurved & Research (PIAR PG)', 'Academic Blocks (A-Series)'),
('A19 - PIT Engineering & Hotel Management (PIHMCT)', 'Academic Blocks (A-Series)'),
('A20 - Central Engineering Workshop', 'Academic Blocks (A-Series)'),
('A21 - Parul Institute of Applied Sciences (PIAS)', 'Academic Blocks (A-Series)'),
('A22 - Parul Institute of Design, Fine Arts & Performing Arts', 'Academic Blocks (A-Series)'),
('A23 - Subhash Chandra Bose Bhawan', 'Academic Blocks (A-Series)'),
('A24 - Bhagat Singh Bhawan (PICA)', 'Academic Blocks (A-Series)'),
('A25 - C.V. Raman Centre of Excellence & Data Centre', 'Academic Blocks (A-Series)'),
('A26 - 24 Frames Studio & Media Centre', 'Academic Blocks (A-Series)'),

-- Category 2: Administrative Complex (C-Series)
('C1 - Central Administrative Complex & Central Library', 'Administrative Complex (C-Series)'),

-- Category 3: Hospitals & Healthcare Facilities (E-Series)
('E1 - Parul Ayurved Hospital', 'Hospitals & Healthcare Facilities (E-Series)'),
('E2 - Parul Sevashram Hospital (750-Bed Teaching Hospital)', 'Hospitals & Healthcare Facilities (E-Series)'),
('E3 - Khemdas Ayurved Hospital', 'Hospitals & Healthcare Facilities (E-Series)'),
('E4 - Parul Institute of Homoeopathy & Research Hospital', 'Hospitals & Healthcare Facilities (E-Series)'),
('E5 - Jawaharlal Nehru Homoeopathic Medical College Hospital', 'Hospitals & Healthcare Facilities (E-Series)'),

-- Category 4: Student Hostels & Residential Bhawans (H-Series)
('H1–H3 - Shastri Bhawan (Blocks A, B, C)', 'Student Hostels & Bhawans (H-Series)'),
('H4 - Marie Curie Residence', 'Student Hostels & Bhawans (H-Series)'),
('H5–H7 - Sarojini Bhawan (Blocks A, B, C)', 'Student Hostels & Bhawans (H-Series)'),
('H8–H10 - Indira Bhawan (Blocks A, B, C)', 'Student Hostels & Bhawans (H-Series)'),
('H11 - Albert Einstein Residence', 'Student Hostels & Bhawans (H-Series)'),
('H12–H14 - Kalam Bhawan (Blocks A, B, C)', 'Student Hostels & Bhawans (H-Series)'),
('H15–H16 - Tagore Bhawan (Blocks A, B)', 'Student Hostels & Bhawans (H-Series)'),
('H17 - Dhyan Bhawan', 'Student Hostels & Bhawans (H-Series)'),
('H18 - Janki Bhawan', 'Student Hostels & Bhawans (H-Series)'),
('H19–H22 - Teresa Bhawan (Blocks A, B, C, D)', 'Student Hostels & Bhawans (H-Series)'),
('H23–H24 - Shakuntala Bhawan (Blocks A, B)', 'Student Hostels & Bhawans (H-Series)'),
('H25–H26 - Atal Bhawan (Blocks A1, A2)', 'Student Hostels & Bhawans (H-Series)'),
('H27 - Milkha Bhawan', 'Student Hostels & Bhawans (H-Series)'),
('H28–H29 - Kalpana Bhawan (Blocks A, B)', 'Student Hostels & Bhawans (H-Series)'),
('H30–H31 - Sardar Bhawan (Blocks A, B)', 'Student Hostels & Bhawans (H-Series)'),
('University Faculty & Staff Quarters', 'Student Hostels & Bhawans (H-Series)'),
('VIP & University Guest House', 'Student Hostels & Bhawans (H-Series)'),

-- Category 5: Food Courts, Cafes & Canteens (F-Series)
('F1 - Parul Central Food Court (Main Avenue)', 'Food Courts, Cafes & Canteens (F-Series)'),
('F2 - New Food Court (North Hostel Cluster)', 'Food Courts, Cafes & Canteens (F-Series)'),
('F3 - South Spot Food Court (Engineering Wing)', 'Food Courts, Cafes & Canteens (F-Series)'),
('F4 - Food Junction (Student Activity Spine)', 'Food Courts, Cafes & Canteens (F-Series)'),
('F5 - Mummy n’ Yummy (Women Self-Help Collective)', 'Food Courts, Cafes & Canteens (F-Series)'),
('F6 - The Student Cafe (Adjacent to Central Library & FMS)', 'Food Courts, Cafes & Canteens (F-Series)'),
('F7 - Indian Salt Eatery (Kalpana Bhawan 1st Floor)', 'Food Courts, Cafes & Canteens (F-Series)'),
('F8 - Sarthi Canteen (West Campus Perimeter)', 'Food Courts, Cafes & Canteens (F-Series)'),
('F9 - Subway Campus Outlet (Central Food Court Plaza)', 'Food Courts, Cafes & Canteens (F-Series)'),
('F10 - Brown Burger Cafe (Central Food Court)', 'Food Courts, Cafes & Canteens (F-Series)'),
('F11 - Café Appetito (Academic Spine)', 'Food Courts, Cafes & Canteens (F-Series)'),
('F12 - Havmor Ice Cream Parlour (Food Court Plaza)', 'Food Courts, Cafes & Canteens (F-Series)'),
('F13 - Amul Parlour & Dairy Kiosks (Hostel & Academic Walkways)', 'Food Courts, Cafes & Canteens (F-Series)'),
('F14 - Nescafé Kiosk (Engineering / Block A1-A2)', 'Food Courts, Cafes & Canteens (F-Series)'),
('F15 - Nescafé Kiosk (Parul Sevashram Hospital / Block A12)', 'Food Courts, Cafes & Canteens (F-Series)'),
('F16 - Mahadev Food Corner (Near Gate 2 / Residential Area)', 'Food Courts, Cafes & Canteens (F-Series)'),

-- Category 6: Hostel Dining Mess Facilities (M-Series)
('M1 - Kalam Bhawan Central Dining Mess', 'Hostel Dining Mess Facilities (M-Series)'),
('M2 - Shastri Bhawan Dining Mess', 'Hostel Dining Mess Facilities (M-Series)'),
('M3 - Tagore Bhawan Dining Mess', 'Hostel Dining Mess Facilities (M-Series)'),
('M4 - Sarojini Bhawan Dining Mess', 'Hostel Dining Mess Facilities (M-Series)'),
('M5 - Kalpana Bhawan Dining Mess', 'Hostel Dining Mess Facilities (M-Series)'),
('M6 - Teresa Bhawan Dining Mess', 'Hostel Dining Mess Facilities (M-Series)'),
('M7 - Sardar Bhawan Dining Mess', 'Hostel Dining Mess Facilities (M-Series)'),
('M8 - Atal Bhawan Dining Mess', 'Hostel Dining Mess Facilities (M-Series)'),

-- Category 7: Sports & Recreation Facilities (G & S Series)
('G1 - Parul Multi-Purpose Football Ground', 'Sports & Recreation Facilities (G & S Series)'),
('G2 - Parul Cricket Stadium & Training Ground', 'Sports & Recreation Facilities (G & S Series)'),
('G3 - Basketball & Volleyball Sports Complex', 'Sports & Recreation Facilities (G & S Series)'),
('G4 - Synthetic Tennis Courts Complex', 'Sports & Recreation Facilities (G & S Series)'),
('G5 - Indoor Sports Stadium & Badminton Hall', 'Sports & Recreation Facilities (G & S Series)'),
('S1 - Olympic-Size Swimming Pool Complex', 'Sports & Recreation Facilities (G & S Series)'),

-- Category 8: Campus Landmarks, Utilities & Transport
('B1 - Central Bank of India Branch & ATM Centre', 'Campus Landmarks, Utilities & Transport'),
('Main Campus Entrance Gate No. 1 (Waghodia Road)', 'Campus Landmarks, Utilities & Transport'),
('Hospital & Emergency Gate No. 2', 'Campus Landmarks, Utilities & Transport'),
('Hostel & Transport Depot Gate No. 3', 'Campus Landmarks, Utilities & Transport'),
('Parul Central Bus Terminal & Transport Command Office', 'Campus Landmarks, Utilities & Transport'),
('Watcher’s Park & Central Musical Fountain Garden', 'Campus Landmarks, Utilities & Transport'),
('Jay Sudha Botanical & Medicinal Herbal Garden', 'Campus Landmarks, Utilities & Transport'),
('Parul Grand Open-Air Amphitheatre', 'Campus Landmarks, Utilities & Transport'),
('Campus Shiv & Gayatri Temple Complex', 'Campus Landmarks, Utilities & Transport'),
('Central Estate & Maintenance Department Workshop (A23 Ground)', 'Campus Landmarks, Utilities & Transport');
