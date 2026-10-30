/**
 * Official Parul University Campus Buildings, Food Courts & Landmarks Data
 * Limda, Waghodia, Vadodara, Gujarat
 * Verified against official Parul University Campus Guide Map & Infrastructure Layout
 */

export interface CampusBuilding {
  id: string;
  code: string;
  name: string;
  category: 
    | 'Academic Blocks (A-Series)'
    | 'Administrative Complex (C-Series)'
    | 'Hospitals & Healthcare Facilities (E-Series)'
    | 'Student Hostels & Bhawans (H-Series)'
    | 'Food Courts, Cafes & Canteens (F-Series)'
    | 'Hostel Dining Mess Facilities (M-Series)'
    | 'Sports & Recreation Facilities (G & S Series)'
    | 'Campus Landmarks, Utilities & Transport';
  shortName: string;
  facilities: string;
  keywords: string[];
}

export const PARUL_CAMPUS_BUILDINGS: CampusBuilding[] = [
  // ==========================================
  // Category 1: Academic Blocks (A-Series)
  // ==========================================
  {
    id: 'pu-bld-a1',
    code: 'A1',
    name: 'A1 - Parul Institute of Engineering & Technology (PIET)',
    category: 'Academic Blocks (A-Series)',
    shortName: 'PIET Main Building',
    facilities: 'Core Engineering, CSE, IT, Electrical, Mechanical, Advanced Computing Labs',
    keywords: ['a1', 'piet', 'engineering', 'computer science', 'cse', 'it lab', 'mechanical lab', 'electrical engineering']
  },
  {
    id: 'pu-bld-a2',
    code: 'A2',
    name: 'A2 - PIET Diploma Studies & Administration',
    category: 'Academic Blocks (A-Series)',
    shortName: 'PIET Diploma & HR',
    facilities: 'Diploma Engineering, HR Department, Staff Administration Offices',
    keywords: ['a2', 'diploma engineering', 'hr department', 'administration', 'staff hr']
  },
  {
    id: 'pu-bld-a3',
    code: 'A3',
    name: 'A3 - PIET D-Block (Advanced Labs)',
    category: 'Academic Blocks (A-Series)',
    shortName: 'PIET D-Block',
    facilities: 'Advanced Engineering Research Labs, High-Tech Classrooms, Innovation Hub',
    keywords: ['a3', 'piet d block', 'd block', 'advanced labs', 'research labs']
  },
  {
    id: 'pu-bld-a4',
    code: 'A4',
    name: 'A4 - Parul Institute of Pharmacy (PIP)',
    category: 'Academic Blocks (A-Series)',
    shortName: 'PIP Pharmacy',
    facilities: 'Faculty of Pharmacy, Pharmaceutics & Pharmacognosy Labs, Analytical Room',
    keywords: ['a4', 'pip', 'pharmacy', 'pharmaceutics', 'pharmacognosy', 'pharma lab']
  },
  {
    id: 'pu-bld-a5',
    code: 'A5',
    name: 'A5 - PIET Diploma & Central Gymnasium',
    category: 'Academic Blocks (A-Series)',
    shortName: 'PIET Diploma & Central Gym',
    facilities: 'Diploma Classrooms, University Fitness Center & Central Gym',
    keywords: ['a5', 'central gym', 'gymnasium', 'diploma wing', 'fitness center']
  },
  {
    id: 'pu-bld-a6',
    code: 'A6',
    name: 'A6 - Parul Institute of Nursing',
    category: 'Academic Blocks (A-Series)',
    shortName: 'Nursing College',
    facilities: 'Faculty of Nursing, Simulation Clinical Training Labs, Nursing Anatomy Ward',
    keywords: ['a6', 'nursing', 'nursing college', 'nursing lab', 'clinical training']
  },
  {
    id: 'pu-bld-a7',
    code: 'A7',
    name: 'A7 - Jawaharlal Nehru Homoeopathic Medical College & Physiotherapy',
    category: 'Academic Blocks (A-Series)',
    shortName: 'JNHMC & Physiotherapy',
    facilities: 'JNHMC Classrooms, Homeopathic Department & Parul Institute of Physiotherapy',
    keywords: ['a7', 'jnhmc', 'homoeopathy', 'physiotherapy', 'homeopathic college']
  },
  {
    id: 'pu-bld-a8',
    code: 'A8',
    name: 'A8 - Parul Institute of Pharmacy & Research (PIPR)',
    category: 'Academic Blocks (A-Series)',
    shortName: 'PIPR Research Block',
    facilities: 'Postgraduate Pharmaceutical Research Labs, Quality Assurance, Medicinal Chemistry',
    keywords: ['a8', 'pipr', 'pharmacy research', 'pg pharmacy', 'medicinal chemistry']
  },
  {
    id: 'pu-bld-a9',
    code: 'A9',
    name: 'A9 - Parul Polytechnic Institute (PPI)',
    category: 'Academic Blocks (A-Series)',
    shortName: 'PPI Polytechnic',
    facilities: 'Polytechnic Diploma Studies, Fluid Mechanics, Electronics & Workshop Labs',
    keywords: ['a9', 'ppi', 'polytechnic', 'polytechnic institute', 'diploma labs']
  },
  {
    id: 'pu-bld-a10',
    code: 'A10',
    name: 'A10 - School of Pharmacy',
    category: 'Academic Blocks (A-Series)',
    shortName: 'School of Pharmacy',
    facilities: 'Undergraduate Pharmacy Classrooms, Analytical Chemistry Labs',
    keywords: ['a10', 'school of pharmacy', 'pharma classrooms', 'analytical lab']
  },
  {
    id: 'pu-bld-a11',
    code: 'A11',
    name: 'A11 - Medical Library & Insights Support Centre',
    category: 'Academic Blocks (A-Series)',
    shortName: 'Medical Library & Insights',
    facilities: 'Central Health Sciences Library, Student Counseling Center, Psychological Guidance',
    keywords: ['a11', 'medical library', 'insights', 'counseling center', 'health library']
  },
  {
    id: 'pu-bld-a12',
    code: 'A12',
    name: 'A12 - Parul Institute of Medical Sciences & Research (PIMSR)',
    category: 'Academic Blocks (A-Series)',
    shortName: 'PIMSR Medical College',
    facilities: 'MBBS Lecture Halls, Anatomy Dissection Hall, Pathology Lab, Armed Forces Cell, Symphony Hall',
    keywords: ['a12', 'pimsr', 'medical college', 'mbbs', 'symphony hall', 'anatomy hall', 'armed forces cell']
  },
  {
    id: 'pu-bld-a13',
    code: 'A13',
    name: 'A13 - Parul Institute of Ayurved',
    category: 'Academic Blocks (A-Series)',
    shortName: 'Ayurved College',
    facilities: 'Faculty of Ayurveda, Herbal Medicine Museum, Panchakarma Units, Dravyaguna Lab',
    keywords: ['a13', 'ayurved', 'ayurveda college', 'panchakarma', 'herbal medicine']
  },
  {
    id: 'pu-bld-a14',
    code: 'A14',
    name: 'A14 - Parul Institute of Business Administration (PIBA)',
    category: 'Academic Blocks (A-Series)',
    shortName: 'PIBA BBA Building',
    facilities: 'BBA Classrooms, Case Study Halls, Seminar Rooms, Student Presentation Labs',
    keywords: ['a14', 'piba', 'bba', 'business administration', 'bba classrooms']
  },
  {
    id: 'pu-bld-a15',
    code: 'A15',
    name: 'A15 - Faculty of Management Studies (FMS) & Harmony Hall',
    category: 'Academic Blocks (A-Series)',
    shortName: 'FMS MBA Building',
    facilities: 'MBA Classrooms, Executive Seminar Rooms, Harmony Hall, Placement Interview Suites',
    keywords: ['a15', 'fms', 'mba', 'harmony hall', 'management studies', 'placement suites']
  },
  {
    id: 'pu-bld-a16',
    code: 'A16',
    name: 'A16 - Parul Institute of Architecture & Design Research',
    category: 'Academic Blocks (A-Series)',
    shortName: 'PIAR Architecture Block',
    facilities: 'Architecture Studios, Drafting Rooms, Model Making Workshop, Material Museum',
    keywords: ['a16', 'piar', 'architecture', 'drafting studio', 'model workshop']
  },
  {
    id: 'pu-bld-a17',
    code: 'A17',
    name: 'A17 - Parul Institute of Homoeopathy & Research (PIHR)',
    category: 'Academic Blocks (A-Series)',
    shortName: 'PIHR Block',
    facilities: 'Homeopathic Academic Department, Research Clinics, Materia Medica Department',
    keywords: ['a17', 'pihr', 'homeopathy research', 'materia medica', 'homeopathic clinics']
  },
  {
    id: 'pu-bld-a18',
    code: 'A18',
    name: 'A18 - Parul Institute of Ayurved & Research (PIAR PG)',
    category: 'Academic Blocks (A-Series)',
    shortName: 'PIAR PG Ayurved',
    facilities: 'Ayurvedic Advanced Research & Postgraduate Studies, Rasa Shastra Labs',
    keywords: ['a18', 'piar pg', 'ayurved research', 'rasa shastra', 'pg ayurved']
  },
  {
    id: 'pu-bld-a19',
    code: 'A19',
    name: 'A19 - PIT Engineering & Hotel Management (PIHMCT)',
    category: 'Academic Blocks (A-Series)',
    shortName: 'PIT & Hotel Management',
    facilities: 'Parul Institute of Technology, Training Kitchens, Bakery Lab, Model Restaurant & Bar',
    keywords: ['a19', 'pit', 'pihmct', 'hotel management', 'training kitchen', 'bakery lab']
  },
  {
    id: 'pu-bld-a20',
    code: 'A20',
    name: 'A20 - Central Engineering Workshop',
    category: 'Academic Blocks (A-Series)',
    shortName: 'Central Workshop',
    facilities: 'Mechanical Workshop, Welding, Carpentry, CNC & Smithy, Foundry Section',
    keywords: ['a20', 'workshop', 'central workshop', 'carpentry', 'welding', 'cnc lab', 'smithy']
  },
  {
    id: 'pu-bld-a21',
    code: 'A21',
    name: 'A21 - Parul Institute of Applied Sciences (PIAS)',
    category: 'Academic Blocks (A-Series)',
    shortName: 'PIAS Applied Sciences',
    facilities: 'Biotechnology, Microbiology, Chemistry, Biochemistry Labs, Tissue Culture Room',
    keywords: ['a21', 'pias', 'applied sciences', 'biotechnology', 'microbiology', 'biochemistry lab']
  },
  {
    id: 'pu-bld-a22',
    code: 'A22',
    name: 'A22 - Parul Institute of Design, Fine Arts & Performing Arts',
    category: 'Academic Blocks (A-Series)',
    shortName: 'PID Design & Fine Arts',
    facilities: 'PID, PIFA, PIPA Studios, Exhibition Halls, Fashion Labs, Clay & Sculpture Studio',
    keywords: ['a22', 'pid', 'pifa', 'pipa', 'design block', 'fine arts', 'fashion lab', 'sculpture studio']
  },
  {
    id: 'pu-bld-a23',
    code: 'A23',
    name: 'A23 - Subhash Chandra Bose Bhawan',
    category: 'Academic Blocks (A-Series)',
    shortName: 'Subhash Chandra Bose Bhawan',
    facilities: 'Faculty of Law, Commerce, Arts, Social Work, Agriculture, Estate & Maintenance Office, CCEOL',
    keywords: ['a23', 'subhash chandra bose', 'bose bhawan', 'law faculty', 'commerce', 'estate office', 'cceol', 'agriculture']
  },
  {
    id: 'pu-bld-a24',
    code: 'A24',
    name: 'A24 - Bhagat Singh Bhawan (PICA)',
    category: 'Academic Blocks (A-Series)',
    shortName: 'Bhagat Singh Bhawan',
    facilities: 'Parul Institute of Computer Application (PICA), MCA, BCA Labs, Director Academics Office',
    keywords: ['a24', 'bhagat singh bhawan', 'pica', 'mca', 'bca', 'computer application', 'director academics']
  },
  {
    id: 'pu-bld-a25',
    code: 'A25',
    name: 'A25 - C.V. Raman Centre of Excellence & Data Centre',
    category: 'Academic Blocks (A-Series)',
    shortName: 'C.V. Raman Hub',
    facilities: 'Advanced Computational Skills Hub, University Main Data Centre, System Support Cell, Tinkering Lab',
    keywords: ['a25', 'cv raman', 'data centre', 'server room', 'system support cell', 'tinkering hub']
  },
  {
    id: 'pu-bld-a26',
    code: 'A26',
    name: 'A26 - 24 Frames Studio & Media Centre',
    category: 'Academic Blocks (A-Series)',
    shortName: '24 Frames Media Studio',
    facilities: 'Film, Media, VFX, Sound Recording, Green Screen & Digital Audio-Video Production',
    keywords: ['a26', '24 frames', 'media studio', 'vfx studio', 'sound recording', 'green screen']
  },

  // ==========================================
  // Category 2: Administrative Complex (C-Series)
  // ==========================================
  {
    id: 'pu-bld-c1',
    code: 'C1',
    name: 'C1 - Central Administrative Complex & Central Library',
    category: 'Administrative Complex (C-Series)',
    shortName: 'Central Admin & Library',
    facilities: 'Student Section, Scholarship Section, Accounts & Fees, Registrar Office, Vice Chancellor Secretariat, Central University Library',
    keywords: ['c1', 'admin block', 'central admin', 'student section', 'scholarship', 'accounts', 'registrar', 'central library']
  },

  // ==========================================
  // Category 3: Hospitals & Healthcare Facilities (E-Series)
  // ==========================================
  {
    id: 'pu-bld-e1',
    code: 'E1',
    name: 'E1 - Parul Ayurved Hospital',
    category: 'Hospitals & Healthcare Facilities (E-Series)',
    shortName: 'Parul Ayurved Hospital',
    facilities: 'Ayurvedic Inpatient & Outpatient Consultation, Panchakarma Therapy Centre',
    keywords: ['e1', 'ayurved hospital', 'panchakarma hospital', 'ayurvedic opd']
  },
  {
    id: 'pu-bld-e2',
    code: 'E2',
    name: 'E2 - Parul Sevashram Hospital (750-Bed Teaching Hospital)',
    category: 'Hospitals & Healthcare Facilities (E-Series)',
    shortName: 'Parul Sevashram Hospital',
    facilities: '750-Bed Multi-Specialty Hospital, 24/7 Emergency Casualty, ICU, Operation Theatres, Blood Bank, Radiology',
    keywords: ['e2', 'sevashram', 'sevashram hospital', 'hospital', 'emergency', 'casualty', 'icu', 'blood bank']
  },
  {
    id: 'pu-bld-e3',
    code: 'E3',
    name: 'E3 - Khemdas Ayurved Hospital',
    category: 'Hospitals & Healthcare Facilities (E-Series)',
    shortName: 'Khemdas Ayurved Hospital',
    facilities: 'Clinical Herbal Healthcare, Outpatient Ayurvedic Units',
    keywords: ['e3', 'khemdas', 'khemdas hospital', 'ayurvedic clinical center']
  },
  {
    id: 'pu-bld-e4',
    code: 'E4',
    name: 'E4 - Parul Institute of Homoeopathy & Research Hospital',
    category: 'Hospitals & Healthcare Facilities (E-Series)',
    shortName: 'PIHR Homoeopathic Hospital',
    facilities: 'Homeopathic Inpatient & Consultation Hospital, Clinical Labs',
    keywords: ['e4', 'pihr hospital', 'homeopathy hospital', 'homeopathic consultation']
  },
  {
    id: 'pu-bld-e5',
    code: 'E5',
    name: 'E5 - Jawaharlal Nehru Homoeopathic Medical College Hospital',
    category: 'Hospitals & Healthcare Facilities (E-Series)',
    shortName: 'JNHMC Hospital',
    facilities: 'Clinical Training Hospital for Homeopathy, OPD/IPD Medical Care',
    keywords: ['e5', 'jnhmc hospital', 'nehru homeopathy hospital']
  },

  // ==========================================
  // Category 4: Student Hostels & Residential Bhawans (H-Series)
  // ==========================================
  {
    id: 'pu-bld-h1-3',
    code: 'H1-H3',
    name: 'H1–H3 - Shastri Bhawan (Blocks A, B, C)',
    category: 'Student Hostels & Bhawans (H-Series)',
    shortName: 'Shastri Bhawan',
    facilities: 'Boys Hostel, Study Rooms, Wi-Fi Zones, Warden Office',
    keywords: ['h1', 'h2', 'h3', 'shastri bhawan', 'shastri hostel', 'boys hostel shastri']
  },
  {
    id: 'pu-bld-h4',
    code: 'H4',
    name: 'H4 - Marie Curie Residence',
    category: 'Student Hostels & Bhawans (H-Series)',
    shortName: 'Marie Curie Residence',
    facilities: 'International Students & Girls Luxury Residence, Common Lounge',
    keywords: ['h4', 'marie curie', 'marie curie hostel', 'international girls hostel']
  },
  {
    id: 'pu-bld-h5-7',
    code: 'H5-H7',
    name: 'H5–H7 - Sarojini Bhawan (Blocks A, B, C)',
    category: 'Student Hostels & Bhawans (H-Series)',
    shortName: 'Sarojini Bhawan',
    facilities: 'Girls Hostel Complex, Recreation Lounge, 24/7 Security Desk',
    keywords: ['h5', 'h6', 'h7', 'sarojini bhawan', 'sarojini hostel', 'girls hostel sarojini']
  },
  {
    id: 'pu-bld-h8-10',
    code: 'H8-H10',
    name: 'H8–H10 - Indira Bhawan (Blocks A, B, C)',
    category: 'Student Hostels & Bhawans (H-Series)',
    shortName: 'Indira Bhawan',
    facilities: 'Girls Hostel Complex, Reading Rooms, Indoor Games',
    keywords: ['h8', 'h9', 'h10', 'indira bhawan', 'indira hostel', 'girls hostel indira']
  },
  {
    id: 'pu-bld-h11',
    code: 'H11',
    name: 'H11 - Albert Einstein Residence',
    category: 'Student Hostels & Bhawans (H-Series)',
    shortName: 'Albert Einstein Residence',
    facilities: 'Boys International & Premium Residence Wing',
    keywords: ['h11', 'albert einstein', 'einstein residence', 'boys international hostel']
  },
  {
    id: 'pu-bld-h12-14',
    code: 'H12-H14',
    name: 'H12–H14 - Kalam Bhawan (Blocks A, B, C)',
    category: 'Student Hostels & Bhawans (H-Series)',
    shortName: 'Kalam Bhawan',
    facilities: 'Boys Hostel Complex, Large Common Courtyard, Warden Desk',
    keywords: ['h12', 'h13', 'h14', 'kalam bhawan', 'kalam hostel', 'boys hostel kalam']
  },
  {
    id: 'pu-bld-h15-16',
    code: 'H15-H16',
    name: 'H15–H16 - Tagore Bhawan (Blocks A, B)',
    category: 'Student Hostels & Bhawans (H-Series)',
    shortName: 'Tagore Bhawan',
    facilities: 'Boys Hostel Complex, Recreation Room, Study Terraces',
    keywords: ['h15', 'h16', 'tagore bhawan', 'tagore hostel', 'boys hostel tagore']
  },
  {
    id: 'pu-bld-h17',
    code: 'H17',
    name: 'H17 - Dhyan Bhawan',
    category: 'Student Hostels & Bhawans (H-Series)',
    shortName: 'Dhyan Bhawan',
    facilities: 'Student Residence, Quiet Reflection Wing & Meditation Hall',
    keywords: ['h17', 'dhyan bhawan', 'dhyan hostel', 'meditation residence']
  },
  {
    id: 'pu-bld-h18',
    code: 'H18',
    name: 'H18 - Janki Bhawan',
    category: 'Student Hostels & Bhawans (H-Series)',
    shortName: 'Janki Bhawan',
    facilities: 'Girls Hostel Wing, Warden Office, Study Lounge',
    keywords: ['h18', 'janki bhawan', 'janki hostel', 'girls hostel janki']
  },
  {
    id: 'pu-bld-h19-22',
    code: 'H19-H22',
    name: 'H19–H22 - Teresa Bhawan (Blocks A, B, C, D)',
    category: 'Student Hostels & Bhawans (H-Series)',
    shortName: 'Teresa Bhawan',
    facilities: 'Girls Hostel Multi-Block Wing, Badminton Court, Security Gate',
    keywords: ['h19', 'h20', 'h21', 'h22', 'teresa bhawan', 'mother teresa', 'teresa hostel']
  },
  {
    id: 'pu-bld-h23-24',
    code: 'H23-H24',
    name: 'H23–H24 - Shakuntala Bhawan (Blocks A, B)',
    category: 'Student Hostels & Bhawans (H-Series)',
    shortName: 'Shakuntala Bhawan',
    facilities: 'Girls Hostel Wing, Courtyard Garden, Student Lounge',
    keywords: ['h23', 'h24', 'shakuntala bhawan', 'shakuntala hostel']
  },
  {
    id: 'pu-bld-h25-26',
    code: 'H25-H26',
    name: 'H25–H26 - Atal Bhawan (Blocks A1, A2)',
    category: 'Student Hostels & Bhawans (H-Series)',
    shortName: 'Atal Bhawan',
    facilities: 'Boys Hostel Wing, Gymnasium access, Wi-Fi Zones',
    keywords: ['h25', 'h26', 'atal bhawan', 'atal hostel', 'boys hostel atal']
  },
  {
    id: 'pu-bld-h27',
    code: 'H27',
    name: 'H27 - Milkha Bhawan',
    category: 'Student Hostels & Bhawans (H-Series)',
    shortName: 'Milkha Bhawan',
    facilities: 'Boys Sports & Student Hostel, Direct access to Sports Complex',
    keywords: ['h27', 'milkha bhawan', 'milkha singh', 'sports hostel']
  },
  {
    id: 'pu-bld-h28-29',
    code: 'H28-H29',
    name: 'H28–H29 - Kalpana Bhawan (Blocks A, B)',
    category: 'Student Hostels & Bhawans (H-Series)',
    shortName: 'Kalpana Bhawan',
    facilities: 'Girls Hostel Complex, Indian Salt Eatery on 1st Floor, Laundry Facilities',
    keywords: ['h28', 'h29', 'kalpana bhawan', 'kalpana chawla hostel', 'girls hostel kalpana']
  },
  {
    id: 'pu-bld-h30-31',
    code: 'H30-H31',
    name: 'H30–H31 - Sardar Bhawan (Blocks A, B)',
    category: 'Student Hostels & Bhawans (H-Series)',
    shortName: 'Sardar Bhawan',
    facilities: 'Boys Hostel Complex, Reading Area, Common Recreation Hall',
    keywords: ['h30', 'h31', 'sardar bhawan', 'sardar patel hostel', 'boys hostel sardar']
  },
  {
    id: 'pu-bld-staff-qtrs',
    code: 'Staff-Qtrs',
    name: 'University Faculty & Staff Quarters',
    category: 'Student Hostels & Bhawans (H-Series)',
    shortName: 'Faculty & Staff Quarters',
    facilities: 'Residential Quarters for Teaching, Medical & Maintenance Staff',
    keywords: ['staff quarters', 'faculty quarters', 'staff colony', 'teachers residence']
  },
  {
    id: 'pu-bld-guest-house',
    code: 'Guest-House',
    name: 'VIP & University Guest House',
    category: 'Student Hostels & Bhawans (H-Series)',
    shortName: 'VIP Guest House',
    facilities: 'Air-Conditioned Suites for Visiting Dignitaries, External Examiners, Corporate Recruiters',
    keywords: ['guest house', 'vip guest house', 'visitor suites']
  },

  // ==========================================
  // Category 5: Food Courts, Cafes & Canteens (F-Series)
  // ==========================================
  {
    id: 'pu-food-central',
    code: 'F1',
    name: 'F1 - Parul Central Food Court (Main Avenue)',
    category: 'Food Courts, Cafes & Canteens (F-Series)',
    shortName: 'Central Food Court',
    facilities: '20,000 sq ft Mega Food Court, 1,000+ Seating, Multi-Cuisine Brands & Outlets',
    keywords: ['central food court', 'food court', 'main food court', 'pu food court', 'f1']
  },
  {
    id: 'pu-food-new',
    code: 'F2',
    name: 'F2 - New Food Court (North Hostel Cluster)',
    category: 'Food Courts, Cafes & Canteens (F-Series)',
    shortName: 'New Food Court',
    facilities: 'Near Kalam & Sarojini Bhawans, Chaat, Chinese, Fast Food & Refreshments',
    keywords: ['new food court', 'north food court', 'kalam food court', 'f2']
  },
  {
    id: 'pu-food-south',
    code: 'F3',
    name: 'F3 - South Spot Food Court (Engineering Wing)',
    category: 'Food Courts, Cafes & Canteens (F-Series)',
    shortName: 'South Spot Food Court',
    facilities: 'Authentic South Indian Dosas, Idlis, Vadas, Thalis, Filter Coffee',
    keywords: ['south spot', 'south indian food court', 'dosa corner', 'south spot food court', 'f3']
  },
  {
    id: 'pu-food-junction',
    code: 'F4',
    name: 'F4 - Food Junction (Student Activity Spine)',
    category: 'Food Courts, Cafes & Canteens (F-Series)',
    shortName: 'Food Junction',
    facilities: 'Pizzas, Gourmet Burgers, Wraps, Shakes, Asian Bowls & Snacks',
    keywords: ['food junction', 'pizza corner', 'burger junction', 'f4']
  },
  {
    id: 'pu-food-mummy-yummy',
    code: 'F5',
    name: 'F5 - Mummy n’ Yummy (Women Self-Help Collective)',
    category: 'Food Courts, Cafes & Canteens (F-Series)',
    shortName: 'Mummy n’ Yummy',
    facilities: 'Wholesome Home-Style Indian Meals, Rotis, Sabzi, Khichdi & Healthy Parathas',
    keywords: ['mummy n yummy', 'mummy and yummy', 'mummy yummy', 'home food', 'ghar ka khana', 'f5']
  },
  {
    id: 'pu-food-student-cafe',
    code: 'F6',
    name: 'F6 - The Student Cafe (Adjacent to Central Library & FMS)',
    category: 'Food Courts, Cafes & Canteens (F-Series)',
    shortName: 'The Student Cafe',
    facilities: 'Barista Coffee, Bakery, Sandwiches, Brownies, Continental Quick Bites',
    keywords: ['the student cafe', 'student cafe', 'library cafe', 'fms cafe', 'f6']
  },
  {
    id: 'pu-food-indian-salt',
    code: 'F7',
    name: 'F7 - Indian Salt Eatery (Kalpana Bhawan 1st Floor)',
    category: 'Food Courts, Cafes & Canteens (F-Series)',
    shortName: 'Indian Salt Eatery',
    facilities: 'Multi-Cuisine Vegetarian Dining, Thalis, North Indian curries, Evening snacks',
    keywords: ['indian salt', 'indian salt eatery', 'kalpana food', 'f7']
  },
  {
    id: 'pu-food-sarthi',
    code: 'F8',
    name: 'F8 - Sarthi Canteen (West Campus Perimeter)',
    category: 'Food Courts, Cafes & Canteens (F-Series)',
    shortName: 'Sarthi Canteen',
    facilities: 'Tea, Coffee, Gujarati Snacks, Poha, Samosa, Puff, Khaman',
    keywords: ['sarthi canteen', 'sarthi', 'west canteen', 'f8']
  },
  {
    id: 'pu-food-subway',
    code: 'F9',
    name: 'F9 - Subway Campus Outlet (Central Food Court Plaza)',
    category: 'Food Courts, Cafes & Canteens (F-Series)',
    shortName: 'Subway Outlet',
    facilities: 'Fresh Subs, Salads, Wraps, Cookies & Beverages',
    keywords: ['subway', 'subway outlet', 'subway pu', 'f9']
  },
  {
    id: 'pu-food-brown-burger',
    code: 'F10',
    name: 'F10 - Brown Burger Cafe (Central Food Court)',
    category: 'Food Courts, Cafes & Canteens (F-Series)',
    shortName: 'Brown Burger Cafe',
    facilities: 'Craft Burgers, Loaded Fries, Thick Shakes, Crispy Wraps',
    keywords: ['brown burger', 'brown burger cafe', 'burger cafe', 'f10']
  },
  {
    id: 'pu-food-appetito',
    code: 'F11',
    name: 'F11 - Café Appetito (Academic Spine)',
    category: 'Food Courts, Cafes & Canteens (F-Series)',
    shortName: 'Café Appetito',
    facilities: 'Italian Sandwiches, Pasta, Espresso, Frappes & Bakery Bites',
    keywords: ['cafe appetito', 'appetito', 'italian cafe', 'f11']
  },
  {
    id: 'pu-food-havmor',
    code: 'F12',
    name: 'F12 - Havmor Ice Cream Parlour (Food Court Plaza)',
    category: 'Food Courts, Cafes & Canteens (F-Series)',
    shortName: 'Havmor Parlour',
    facilities: 'Ice Cream Scoops, Sundaes, Ice Cream Cones, Dessert Shakes',
    keywords: ['havmor', 'ice cream parlour', 'havmor parlour', 'f12']
  },
  {
    id: 'pu-food-amul',
    code: 'F13',
    name: 'F13 - Amul Parlour & Dairy Kiosks (Hostel & Academic Walkways)',
    category: 'Food Courts, Cafes & Canteens (F-Series)',
    shortName: 'Amul Dairy Parlours',
    facilities: 'Milk, Buttermilk, Curd, Cheese, Ice Creams, Chocolates & Fresh Dairy Products',
    keywords: ['amul', 'amul parlour', 'amul kiosk', 'dairy parlour', 'f13']
  },
  {
    id: 'pu-food-nescafe-piet',
    code: 'F14',
    name: 'F14 - Nescafé Kiosk (Engineering / Block A1-A2)',
    category: 'Food Courts, Cafes & Canteens (F-Series)',
    shortName: 'Nescafé Engineering',
    facilities: 'Hot Coffee, Iced Teas, Maggi Noodles, Veg Patties, Cookies',
    keywords: ['nescafe engineering', 'nescafe a1', 'maggi corner', 'f14']
  },
  {
    id: 'pu-food-nescafe-hospital',
    code: 'F15',
    name: 'F15 - Nescafé Kiosk (Parul Sevashram Hospital / Block A12)',
    category: 'Food Courts, Cafes & Canteens (F-Series)',
    shortName: 'Nescafé Hospital',
    facilities: '24/7 Beverages, Quick Snacks for Hospital Visitors, Doctors & Staff',
    keywords: ['nescafe hospital', 'nescafe sevashram', 'hospital coffee', 'f15']
  },
  {
    id: 'pu-food-mahadev',
    code: 'F16',
    name: 'F16 - Mahadev Food Corner (Near Gate 2 / Residential Area)',
    category: 'Food Courts, Cafes & Canteens (F-Series)',
    shortName: 'Mahadev Food Corner',
    facilities: 'Fresh Parathas, Gujarati Thalis, Kathiyawadi Special, Kadak Tea',
    keywords: ['mahadev food', 'mahadev corner', 'paratha corner', 'f16']
  },

  // ==========================================
  // Category 6: Hostel Dining Mess Facilities (M-Series)
  // ==========================================
  {
    id: 'pu-mess-m1',
    code: 'M1',
    name: 'M1 - Kalam Bhawan Central Dining Mess',
    category: 'Hostel Dining Mess Facilities (M-Series)',
    shortName: 'Kalam Bhawan Mess',
    facilities: 'Large Capacity Dining Hall for Kalam & Adjacent Boys Hostels',
    keywords: ['m1', 'kalam mess', 'kalam bhawan mess', 'boys mess kalam']
  },
  {
    id: 'pu-mess-m2',
    code: 'M2',
    name: 'M2 - Shastri Bhawan Dining Mess',
    category: 'Hostel Dining Mess Facilities (M-Series)',
    shortName: 'Shastri Bhawan Mess',
    facilities: 'Dining Hall serving Shastri Bhawan residents',
    keywords: ['m2', 'shastri mess', 'shastri bhawan mess']
  },
  {
    id: 'pu-mess-m3',
    code: 'M3',
    name: 'M3 - Tagore Bhawan Dining Mess',
    category: 'Hostel Dining Mess Facilities (M-Series)',
    shortName: 'Tagore Bhawan Mess',
    facilities: 'Dining Hall serving Tagore Bhawan residents',
    keywords: ['m3', 'tagore mess', 'tagore bhawan mess']
  },
  {
    id: 'pu-mess-m4',
    code: 'M4',
    name: 'M4 - Sarojini Bhawan Dining Mess',
    category: 'Hostel Dining Mess Facilities (M-Series)',
    shortName: 'Sarojini Bhawan Mess',
    facilities: 'Spacious Dining Hall for Sarojini Girls Hostel residents',
    keywords: ['m4', 'sarojini mess', 'sarojini bhawan mess', 'girls mess sarojini']
  },
  {
    id: 'pu-mess-m5',
    code: 'M5',
    name: 'M5 - Kalpana Bhawan Dining Mess',
    category: 'Hostel Dining Mess Facilities (M-Series)',
    shortName: 'Kalpana Bhawan Mess',
    facilities: 'Dining Hall serving Kalpana Bhawan girls residents',
    keywords: ['m5', 'kalpana mess', 'kalpana bhawan mess']
  },
  {
    id: 'pu-mess-m6',
    code: 'M6',
    name: 'M6 - Teresa Bhawan Dining Mess',
    category: 'Hostel Dining Mess Facilities (M-Series)',
    shortName: 'Teresa Bhawan Mess',
    facilities: 'Multi-Block Dining Facility for Teresa Girls Hostel residents',
    keywords: ['m6', 'teresa mess', 'teresa bhawan mess']
  },
  {
    id: 'pu-mess-m7',
    code: 'M7',
    name: 'M7 - Sardar Bhawan Dining Mess',
    category: 'Hostel Dining Mess Facilities (M-Series)',
    shortName: 'Sardar Bhawan Mess',
    facilities: 'Dining Hall serving Sardar Bhawan boys residents',
    keywords: ['m7', 'sardar mess', 'sardar bhawan mess']
  },
  {
    id: 'pu-mess-m8',
    code: 'M8',
    name: 'M8 - Atal Bhawan Dining Mess',
    category: 'Hostel Dining Mess Facilities (M-Series)',
    shortName: 'Atal Bhawan Mess',
    facilities: 'Dining Hall serving Atal Bhawan boys residents',
    keywords: ['m8', 'atal mess', 'atal bhawan mess']
  },

  // ==========================================
  // Category 7: Sports & Recreation Facilities (G & S Series)
  // ==========================================
  {
    id: 'pu-sport-g1',
    code: 'G1',
    name: 'G1 - Parul Multi-Purpose Football Ground',
    category: 'Sports & Recreation Facilities (G & S Series)',
    shortName: 'Football Ground',
    facilities: 'Full-Sized Natural Grass Football Turf, Running Track, Floodlights',
    keywords: ['g1', 'football ground', 'football turf', 'soccer field']
  },
  {
    id: 'pu-sport-g2',
    code: 'G2',
    name: 'G2 - Parul Cricket Stadium & Training Ground',
    category: 'Sports & Recreation Facilities (G & S Series)',
    shortName: 'Cricket Stadium',
    facilities: 'Cricket Ground, Practice Nets, Pavilion, Tournament Seating',
    keywords: ['g2', 'cricket stadium', 'cricket pitch', 'cricket ground', 'nets']
  },
  {
    id: 'pu-sport-g3',
    code: 'G3',
    name: 'G3 - Basketball & Volleyball Sports Complex',
    category: 'Sports & Recreation Facilities (G & S Series)',
    shortName: 'Basketball & Volleyball Complex',
    facilities: 'Synthetic Outdoor Basketball Courts, Standard Volleyball Courts with Floodlights',
    keywords: ['g3', 'basketball court', 'volleyball court', 'sports complex']
  },
  {
    id: 'pu-sport-g4',
    code: 'G4',
    name: 'G4 - Synthetic Tennis Courts Complex',
    category: 'Sports & Recreation Facilities (G & S Series)',
    shortName: 'Tennis Courts',
    facilities: 'Standard Regulation Hard-Surface Tennis Courts with Viewing Gallery',
    keywords: ['g4', 'tennis court', 'lawn tennis']
  },
  {
    id: 'pu-sport-g5',
    code: 'G5',
    name: 'G5 - Indoor Sports Stadium & Badminton Hall',
    category: 'Sports & Recreation Facilities (G & S Series)',
    shortName: 'Indoor Badminton Hall',
    facilities: 'Multi-Court Wooden Badminton Arenas, Table Tennis Tables, Chess & Carrom Pavilion',
    keywords: ['g5', 'badminton hall', 'table tennis', 'indoor sports', 'indoor stadium']
  },
  {
    id: 'pu-sport-s1',
    code: 'S1',
    name: 'S1 - Olympic-Size Swimming Pool Complex',
    category: 'Sports & Recreation Facilities (G & S Series)',
    shortName: 'Swimming Pool Complex',
    facilities: '50-Meter Standard Swimming Pool, Diving Boards, Lifeguard Station & Changing Rooms',
    keywords: ['s1', 'swimming pool', 'pool', 'olympic pool']
  },

  // ==========================================
  // Category 8: Campus Landmarks, Utilities & Transport
  // ==========================================
  {
    id: 'pu-util-b1',
    code: 'B1',
    name: 'B1 - Central Bank of India Branch & ATM Centre',
    category: 'Campus Landmarks, Utilities & Transport',
    shortName: 'Central Bank of India & ATM',
    facilities: 'Full On-Campus Banking Branch, 24/7 Multi-Bank ATMs, Passbook Kiosk',
    keywords: ['b1', 'bank', 'central bank', 'atm', 'atm center', 'cash withdrawal']
  },
  {
    id: 'pu-util-gate1',
    code: 'Gate-1',
    name: 'Main Campus Entrance Gate No. 1 (Waghodia Road)',
    category: 'Campus Landmarks, Utilities & Transport',
    shortName: 'Gate 1 (Main Entrance)',
    facilities: 'Primary University Gateway, Security Checkpost, Visitor Registration Booth',
    keywords: ['gate 1', 'main gate', 'entrance gate', 'waghodia gate']
  },
  {
    id: 'pu-util-gate2',
    code: 'Gate-2',
    name: 'Hospital & Emergency Gate No. 2',
    category: 'Campus Landmarks, Utilities & Transport',
    shortName: 'Gate 2 (Hospital Gate)',
    facilities: '24/7 Dedicated Ambulance & Emergency Hospital Ingress/Egress',
    keywords: ['gate 2', 'hospital gate', 'emergency gate', 'ambulance entrance']
  },
  {
    id: 'pu-util-gate3',
    code: 'Gate-3',
    name: 'Hostel & Transport Depot Gate No. 3',
    category: 'Campus Landmarks, Utilities & Transport',
    shortName: 'Gate 3 (Hostel & Bus Gate)',
    facilities: 'University Bus Fleet Departure & Residential Area Gate',
    keywords: ['gate 3', 'bus gate', 'hostel gate', 'transport gate']
  },
  {
    id: 'pu-util-transport',
    code: 'Transit',
    name: 'Parul Central Bus Terminal & Transport Command Office',
    category: 'Campus Landmarks, Utilities & Transport',
    shortName: 'Central Bus Terminal',
    facilities: 'Depot for 100+ University Buses connecting Vadodara, Bharuch, Anand & Ahmedabad',
    keywords: ['bus depot', 'bus terminal', 'transport office', 'college bus', 'bus parking']
  },
  {
    id: 'pu-util-park1',
    code: 'Park-1',
    name: 'Watcher’s Park & Central Musical Fountain Garden',
    category: 'Campus Landmarks, Utilities & Transport',
    shortName: 'Watcher’s Park & Fountain',
    facilities: 'Lush Landscaped Green Lawns, Musical Dancing Fountain, Walkway Promenades',
    keywords: ['watchers park', 'fountain garden', 'central park', 'green lawn']
  },
  {
    id: 'pu-util-park2',
    code: 'Park-2',
    name: 'Jay Sudha Botanical & Medicinal Herbal Garden',
    category: 'Campus Landmarks, Utilities & Transport',
    shortName: 'Jay Sudha Botanical Garden',
    facilities: '500+ Rare Ayurvedic Plants, Botany Research Beds, Shaded Gazebos',
    keywords: ['botanical garden', 'jay sudha garden', 'herbal garden', 'medicinal plants']
  },
  {
    id: 'pu-util-amphi',
    code: 'Amphi',
    name: 'Parul Grand Open-Air Amphitheatre',
    category: 'Campus Landmarks, Utilities & Transport',
    shortName: 'Open-Air Amphitheatre',
    facilities: '5,000+ Capacity Tiered Amphitheatre for Cultural Fests, Dhoom, Tech Events & Convocations',
    keywords: ['amphitheatre', 'open air theatre', 'amphi', 'dhoom stage', 'cultural stage']
  },
  {
    id: 'pu-util-temple',
    code: 'Temple',
    name: 'Campus Shiv & Gayatri Temple Complex',
    category: 'Campus Landmarks, Utilities & Transport',
    shortName: 'Campus Temple',
    facilities: 'Spiritual Sanctuary, Peaceful Meditation Courtyard & Daily Aarti Area',
    keywords: ['temple', 'mandir', 'campus temple', 'shiv mandir', 'meditation']
  },
  {
    id: 'pu-util-estate',
    code: 'Estate',
    name: 'Central Estate & Maintenance Department Workshop (A23 Ground)',
    category: 'Campus Landmarks, Utilities & Transport',
    shortName: 'Estate & Maintenance Workshop',
    facilities: 'Electrical Dispatch, Plumbing Yard, Carpentry Maintenance & Emergency Rapid Response Store',
    keywords: ['estate office', 'maintenance workshop', 'estate department', 'maintenance store', 'electrician room']
  }
];

/**
 * Helper to get buildings grouped by category
 */
export function getCampusBuildingsByCategory(): Record<string, CampusBuilding[]> {
  const grouped: Record<string, CampusBuilding[]> = {};
  
  for (const b of PARUL_CAMPUS_BUILDINGS) {
    if (!grouped[b.category]) {
      grouped[b.category] = [];
    }
    grouped[b.category].push(b);
  }
  
  return grouped;
}

/**
 * Fuzzy search / match a string from speech or text against Parul campus buildings
 */
export function matchCampusBuilding(query: string): CampusBuilding | undefined {
  if (!query) return undefined;
  const q = query.toLowerCase().trim();

  // 1. Exact code match (e.g., "A1", "A23", "F5", "H12")
  const exactCode = PARUL_CAMPUS_BUILDINGS.find(
    b => b.code.toLowerCase() === q || q.split(/\s+/).includes(b.code.toLowerCase())
  );
  if (exactCode) return exactCode;

  // 2. Exact or substring match in shortName or name
  const exactName = PARUL_CAMPUS_BUILDINGS.find(
    b => b.name.toLowerCase().includes(q) || b.shortName.toLowerCase().includes(q) || q.includes(b.shortName.toLowerCase())
  );
  if (exactName) return exactName;

  // 3. Keyword matching
  for (const b of PARUL_CAMPUS_BUILDINGS) {
    if (b.keywords.some(k => q.includes(k))) {
      return b;
    }
  }

  return undefined;
}
