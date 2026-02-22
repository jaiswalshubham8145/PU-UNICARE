import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function insertSampleData() {
  try {
    // Insert departments
    const departments = [
      // Engineering & Technology - Computer & IT
      { name: 'Computer Science Engineering', code: 'CSE' },
      { name: 'Artificial Intelligence & Machine Learning', code: 'AIML' },
      { name: 'Data Science', code: 'DS' },
      { name: 'Cyber Security', code: 'CYB' },
      { name: 'Cloud Computing', code: 'CC' },
      { name: 'Internet of Things', code: 'IOT' },
      { name: 'Software Engineering', code: 'SE' },
      { name: 'Information Technology', code: 'IT' },
      { name: 'Computer Applications', code: 'CA' },
      { name: 'Blockchain Technology', code: 'BLK' },
      { name: 'Quantum Computing', code: 'QC' },
      { name: 'Game Development', code: 'GD' },
      { name: 'Full Stack Development', code: 'FSD' },
      { name: 'Mobile Application Development', code: 'MAD' },

      // Core Engineering
      { name: 'Mechanical Engineering', code: 'ME' },
      { name: 'Civil Engineering', code: 'CE' },
      { name: 'Electrical Engineering', code: 'EE' },
      { name: 'Electronics Engineering', code: 'ELE' },
      { name: 'Electronics & Communication Engineering', code: 'ECE' },
      { name: 'Instrumentation Engineering', code: 'IE' },
      { name: 'Mechatronics Engineering', code: 'MECH' },
      { name: 'Chemical Engineering', code: 'CHE' },
      { name: 'Metallurgical Engineering', code: 'MET' },
      { name: 'Mining Engineering', code: 'MIN' },
      { name: 'Petroleum Engineering', code: 'PET' },
      { name: 'Marine Engineering', code: 'MAR' },
      { name: 'Industrial Engineering', code: 'INDENG' },
      { name: 'Production Engineering', code: 'PROD' },

      // Advanced / Specialized Engineering
      { name: 'Aerospace Engineering', code: 'AERO' },
      { name: 'Aeronautical Engineering', code: 'AERON' },
      { name: 'Robotics Engineering', code: 'ROB' },
      { name: 'Automation Engineering', code: 'AUTOM' },
      { name: 'Nanotechnology Engineering', code: 'NANO' },
      { name: 'Biomedical Engineering', code: 'BIOMED' },
      { name: 'Environmental Engineering', code: 'ENVENG' },
      { name: 'Energy Engineering', code: 'ENE' },
      { name: 'Nuclear Engineering', code: 'NUC' },
      { name: 'Automotive Engineering', code: 'AUTOMOT' },

      // Science & Applied Science - Pure Sciences
      { name: 'Physics', code: 'PHY' },
      { name: 'Chemistry', code: 'CHEM' },
      { name: 'Mathematics', code: 'MATH' },
      { name: 'Statistics', code: 'STAT' },
      { name: 'Pure Mathematics', code: 'PMATH' },
      { name: 'Applied Mathematics', code: 'AMATH' },

      // Life Sciences
      { name: 'Biology', code: 'BIOL' },
      { name: 'Microbiology', code: 'MICROL' },
      { name: 'Biotechnology', code: 'BIOTECH' },
      { name: 'Genetics', code: 'GEN' },
      { name: 'Biochemistry', code: 'BIOCHEM' },
      { name: 'Zoology', code: 'ZOO' },
      { name: 'Botany', code: 'BOT' },
      { name: 'Molecular Biology', code: 'MOLBIO' },
      { name: 'Neuroscience', code: 'NEURO' },
      { name: 'Bioinformatics', code: 'BIOINFO' },

      // Earth & Environmental Sciences
      { name: 'Environmental Science', code: 'ENVSCI' },
      { name: 'Geology', code: 'GEO' },
      { name: 'Geography', code: 'GEOG' },
      { name: 'Geophysics', code: 'GEOPHY' },
      { name: 'Oceanography', code: 'OCEAN' },
      { name: 'Atmospheric Science', code: 'ATMOS' },
      { name: 'Climate Science', code: 'CLIM' },
      { name: 'Disaster Management', code: 'DISM' },

      // Medical & Health Sciences - Medical
      { name: 'MBBS', code: 'MBBS' },
      { name: 'MD / MS', code: 'MDMS' },
      { name: 'Anatomy', code: 'ANAT' },
      { name: 'Physiology', code: 'PHYSIOL' },
      { name: 'Pathology', code: 'PATH' },
      { name: 'Pharmacology', code: 'PHARMAC' },
      { name: 'Microbiology', code: 'MICROM' },
      { name: 'Community Medicine', code: 'COMM' },
      { name: 'Forensic Medicine', code: 'FORENSIC' },

      // Allied Health Sciences
      { name: 'Nursing', code: 'NURS' },
      { name: 'Physiotherapy', code: 'PHYSIO' },
      { name: 'Occupational Therapy', code: 'OT' },
      { name: 'Radiology & Imaging Technology', code: 'RAD' },
      { name: 'Medical Laboratory Technology', code: 'MLT' },
      { name: 'Operation Theatre Technology', code: 'OTT' },
      { name: 'Dialysis Technology', code: 'DIAL' },
      { name: 'Optometry', code: 'OPTO' },
      { name: 'Audiology & Speech Therapy', code: 'AUD' },

      // Pharmacy
      { name: 'Pharmacy', code: 'PHARMA' },
      { name: 'Clinical Pharmacy', code: 'CLINPHARM' },
      { name: 'Pharmaceutical Chemistry', code: 'PHARMCHEM' },
      { name: 'Pharmacognosy', code: 'PHARMCOG' },
      { name: 'Pharmacology', code: 'PHARMACL' },

      // Agriculture & Allied Sciences
      { name: 'Agriculture', code: 'AGRI' },
      { name: 'Horticulture', code: 'HORT' },
      { name: 'Forestry', code: 'FOR' },
      { name: 'Agronomy', code: 'AGRON' },
      { name: 'Soil Science', code: 'SOIL' },
      { name: 'Agricultural Economics', code: 'AGRECON' },
      { name: 'Agricultural Engineering', code: 'AGRENG' },
      { name: 'Seed Technology', code: 'SEED' },
      { name: 'Food Technology', code: 'FOOD' },
      { name: 'Dairy Technology', code: 'DAIRY' },
      { name: 'Fisheries Science', code: 'FISH' },
      { name: 'Animal Husbandry', code: 'ANIMH' },
      { name: 'Veterinary Science', code: 'VET' },
      { name: 'Sericulture', code: 'SERI' },

      // Commerce, Management & Business - Commerce
      { name: 'Commerce', code: 'COMMERCE' },
      { name: 'Accounting', code: 'ACC' },
      { name: 'Auditing', code: 'AUD' },
      { name: 'Taxation', code: 'TAX' },
      { name: 'Banking', code: 'BANK' },
      { name: 'Finance', code: 'FIN' },
      { name: 'Cost & Management Accounting', code: 'CMA' },

      // Management
      { name: 'Business Administration', code: 'BBA' },
      { name: 'Human Resource Management', code: 'HRM' },
      { name: 'Marketing Management', code: 'MKT' },
      { name: 'Finance Management', code: 'FINM' },
      { name: 'Operations Management', code: 'OPS' },
      { name: 'International Business', code: 'IB' },
      { name: 'Entrepreneurship', code: 'ENT' },
      { name: 'Supply Chain Management', code: 'SCM' },
      { name: 'Logistics Management', code: 'LOG' },
      { name: 'Hospital Management', code: 'HM' },
      { name: 'Event Management', code: 'EM' },
      { name: 'Retail Management', code: 'RM' },
      { name: 'Tourism & Travel Management', code: 'TTM' },

      // Law & Legal Studies
      { name: 'Law', code: 'LAW' },
      { name: 'Constitutional Law', code: 'CONLAW' },
      { name: 'Criminal Law', code: 'CRIMLAW' },
      { name: 'Civil Law', code: 'CIVLAW' },
      { name: 'Corporate Law', code: 'CORPLAW' },
      { name: 'Cyber Law', code: 'CYBERLAW' },
      { name: 'International Law', code: 'INTLAW' },
      { name: 'Intellectual Property Rights', code: 'IPR' },
      { name: 'Environmental Law', code: 'ENVLAW' },
      { name: 'Human Rights Law', code: 'HRLAW' },
      { name: 'Maritime Law', code: 'MARLAW' },

      // Arts, Humanities & Social Sciences - Arts & Humanities
      { name: 'English Literature', code: 'ENG' },
      { name: 'Hindi', code: 'HIN' },
      { name: 'Sanskrit', code: 'SAN' },
      { name: 'Regional Languages', code: 'REG' },
      { name: 'Linguistics', code: 'LING' },
      { name: 'Philosophy', code: 'PHIL' },
      { name: 'History', code: 'HIST' },
      { name: 'Political Science', code: 'POLSCI' },
      { name: 'Sociology', code: 'SOC' },
      { name: 'Psychology', code: 'PSY' },
      { name: 'Economics', code: 'ECONARTS' },
      { name: 'Anthropology', code: 'ANTH' },
      { name: 'Archaeology', code: 'ARCH' },
      { name: 'Cultural Studies', code: 'CULT' },
      { name: 'Public Administration', code: 'PUBADM' },

      // Performing & Fine Arts
      { name: 'Music', code: 'MUS' },
      { name: 'Dance', code: 'DAN' },
      { name: 'Theatre & Drama', code: 'THEATRE' },
      { name: 'Fine Arts', code: 'FINE' },
      { name: 'Painting', code: 'PAINT' },
      { name: 'Sculpture', code: 'SCULP' },
      { name: 'Visual Arts', code: 'VISUAL' },

      // Media, Design & Communication
      { name: 'Journalism', code: 'JOUR' },
      { name: 'Mass Communication', code: 'MASSCOMM' },
      { name: 'Media Studies', code: 'MEDIA' },
      { name: 'Advertising', code: 'ADV' },
      { name: 'Public Relations', code: 'PR' },
      { name: 'Digital Media', code: 'DIGMEDIA' },
      { name: 'Film Studies', code: 'FILM' },
      { name: 'Cinematography', code: 'CINEMA' },
      { name: 'Animation & VFX', code: 'ANIMVFX' },
      { name: 'Graphic Design', code: 'GRAPH' },
      { name: 'UI/UX Design', code: 'UIUX' },
      { name: 'Fashion Design', code: 'FASH' },
      { name: 'Textile Design', code: 'TEXT' },
      { name: 'Interior Design', code: 'INT' },
      { name: 'Industrial Design', code: 'INDDES' },

      // Education & Teacher Training
      { name: 'Education', code: 'EDU' },
      { name: 'Teacher Training', code: 'TTRAIN' },
      { name: 'Educational Psychology', code: 'EDUPSY' },
      { name: 'Special Education', code: 'SPED' },
      { name: 'Curriculum & Instruction', code: 'CURR' },
      { name: 'Early Childhood Education', code: 'ECEDU' },
      { name: 'Educational Technology', code: 'EDTECH' },

      // Economics, Policy & Governance
      { name: 'Economics', code: 'ECONPOL' },
      { name: 'Development Studies', code: 'DEV' },
      { name: 'Public Policy', code: 'POLICY' },
      { name: 'International Relations', code: 'IR' },
      { name: 'Strategic Studies', code: 'STRAT' },
      { name: 'Defence Studies', code: 'DEF' },
      { name: 'Governance Studies', code: 'GOV' },

      // Research & Interdisciplinary Studies
      { name: 'Research Methodology', code: 'RESMETH' },
      { name: 'Innovation & Entrepreneurship', code: 'INNOV' },
      { name: 'Interdisciplinary Studies', code: 'INTER' },
      { name: 'Integrated Sciences', code: 'INTSCI' },
      { name: 'Data Analytics', code: 'DATAANAL' },
      { name: 'Computational Sciences', code: 'COMP' },
      { name: 'Artificial Intelligence Research', code: 'AIRES' },
      { name: 'Space Science Research', code: 'SPACERES' },

      // Vocational & Skill-Based Studies
      { name: 'Skill Development', code: 'SKILL' },
      { name: 'Industrial Training', code: 'INDTRAIN' },
      { name: 'Electrician', code: 'ELEC' },
      { name: 'Fitter', code: 'FIT' },
      { name: 'Welder', code: 'WELD' },
      { name: 'Mechanic', code: 'MECHAN' },
      { name: 'Automobile Technology', code: 'AUTOTECH' },
      { name: 'CNC Technology', code: 'CNC' },
      { name: 'Refrigeration & AC', code: 'REF' },
      { name: 'Construction Technology', code: 'CONST' },

      // Emerging & Future Technologies
      { name: 'Artificial Intelligence', code: 'AI' },
      { name: 'Machine Learning', code: 'ML' },
      { name: 'Robotics', code: 'ROBOT' },
      { name: 'Blockchain', code: 'BLOCK' },
      { name: 'Web3', code: 'WEB3' },
      { name: 'Augmented Reality', code: 'AR' },
      { name: 'Virtual Reality', code: 'VR' },
      { name: 'Mixed Reality', code: 'MR' },
      { name: 'Quantum Technology', code: 'QUANT' },
      { name: 'Space Technology', code: 'SPACE' },
      { name: 'Ethical Hacking', code: 'ETHACK' },
      { name: 'Digital Forensics', code: 'DIGFOR' },

      // Multidisciplinary / Integrated Programs
      { name: 'Integrated B.Tech + M.Tech', code: 'INTBTECH' },
      { name: 'Integrated B.Sc + M.Sc', code: 'INTBSC' },
      { name: 'Integrated BA + LLB', code: 'INTBALLB' },
      { name: 'Integrated BBA + LLB', code: 'INTBBALLB' },
      { name: 'Integrated MBA', code: 'INTMBA' },
      { name: 'Liberal Arts', code: 'LIBARTS' },
      { name: 'Interdisciplinary Sciences', code: 'INTERSCI' }
    ];

    const { error: deptError } = await supabase
      .from('departments')
      .insert(departments);

    if (deptError) {
      console.error('Error inserting departments:', deptError);
    } else {
      console.log('Departments inserted successfully');
    }

    // Insert maintenance categories
    const categories = [
      { name: 'Electrical', description: 'Electrical system repairs and maintenance', icon: 'zap' },
      { name: 'Plumbing', description: 'Water supply, drainage, and plumbing issues', icon: 'droplets' },
      { name: 'Carpentry', description: 'Woodwork, furniture, and structural repairs', icon: 'hammer' },
      { name: 'Painting', description: 'Interior and exterior painting services', icon: 'paintbrush' },
      { name: 'HVAC', description: 'Heating, ventilation, and air conditioning', icon: 'fan' },
      { name: 'IT Support', description: 'Computer and network related issues', icon: 'monitor' },
      { name: 'Cleaning', description: 'General cleaning and sanitation', icon: 'broom' },
      { name: 'Security', description: 'Security system and access control', icon: 'shield' },
      { name: 'Landscaping', description: 'Garden and outdoor maintenance', icon: 'leaf' },
      { name: 'Roofing', description: 'Roof repairs and maintenance', icon: 'home' },
      { name: 'Flooring', description: 'Floor repairs and maintenance', icon: 'grid' },
      { name: 'Lighting', description: 'Lighting system repairs', icon: 'lightbulb' },
      { name: 'Doors/Windows', description: 'Door and window repairs', icon: 'door' },
      { name: 'Elevator', description: 'Elevator maintenance and repairs', icon: 'arrow-up-down' },
      { name: 'Fire Safety', description: 'Fire alarm and safety equipment', icon: 'flame' },
      { name: 'Sanitation', description: 'Waste management and sanitation', icon: 'trash' },
      { name: 'Pest Control', description: 'Pest management services', icon: 'bug' },
      { name: 'General Maintenance', description: 'Other maintenance issues', icon: 'wrench' }
    ];

    const { error: catError } = await supabase
      .from('maintenance_categories')
      .insert(categories);

    if (catError) {
      console.error('Error inserting categories:', catError);
    } else {
      console.log('Categories inserted successfully');
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

insertSampleData();