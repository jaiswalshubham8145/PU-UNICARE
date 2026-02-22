-- Create role enum for UNICARE
CREATE TYPE public.app_role AS ENUM ('admin', 'principal', 'hod', 'faculty', 'cr', 'maintenance_staff');

-- Create priority enum
CREATE TYPE public.complaint_priority AS ENUM ('critical', 'high', 'medium', 'low');

-- Create status enum
CREATE TYPE public.complaint_status AS ENUM ('pending', 'acknowledged', 'approved', 'in_progress', 'on_hold', 'completed', 'rejected', 'closed');

-- Departments table
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  department_id UUID REFERENCES public.departments(id),
  employee_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Maintenance categories
CREATE TABLE public.maintenance_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Buildings table
CREATE TABLE public.buildings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Complaints table
CREATE TABLE public.complaints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  complaint_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  department_id UUID REFERENCES public.departments(id) NOT NULL,
  category_id UUID REFERENCES public.maintenance_categories(id),
  building_id UUID REFERENCES public.buildings(id),
  location TEXT NOT NULL,
  priority complaint_priority NOT NULL DEFAULT 'medium',
  status complaint_status NOT NULL DEFAULT 'pending',
  submitted_by UUID REFERENCES auth.users(id) NOT NULL,
  assigned_to UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  expected_resolution DATE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  image_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Complaint updates/timeline
CREATE TABLE public.complaint_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE NOT NULL,
  status complaint_status NOT NULL,
  note TEXT,
  updated_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_updates ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's department
CREATE OR REPLACE FUNCTION public.get_user_department(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT department_id
  FROM public.profiles
  WHERE user_id = _user_id
$$;

-- Departments policies (public read, admin write)
CREATE POLICY "Anyone can view departments" ON public.departments
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage departments" ON public.departments
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Maintenance categories policies (public read)
CREATE POLICY "Anyone can view categories" ON public.maintenance_categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON public.maintenance_categories
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Buildings policies (public read)
CREATE POLICY "Anyone can view buildings" ON public.buildings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage buildings" ON public.buildings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "HODs and Admins can view department profiles" ON public.profiles
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'principal')
    OR (public.has_role(auth.uid(), 'hod') AND department_id = public.get_user_department(auth.uid()))
  );

-- User roles policies (only admins can manage roles)
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Complaints policies
CREATE POLICY "Users can view own complaints" ON public.complaints
  FOR SELECT USING (auth.uid() = submitted_by);

CREATE POLICY "Authenticated users can submit complaints" ON public.complaints
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "HODs can view department complaints" ON public.complaints
  FOR SELECT USING (
    public.has_role(auth.uid(), 'hod') 
    AND department_id = public.get_user_department(auth.uid())
  );

CREATE POLICY "HODs can update department complaints" ON public.complaints
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'hod') 
    AND department_id = public.get_user_department(auth.uid())
  );

CREATE POLICY "Principals can view all complaints" ON public.complaints
  FOR SELECT USING (public.has_role(auth.uid(), 'principal'));

CREATE POLICY "Admins can manage all complaints" ON public.complaints
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Maintenance staff can view assigned complaints" ON public.complaints
  FOR SELECT USING (
    public.has_role(auth.uid(), 'maintenance_staff') 
    AND assigned_to = auth.uid()
  );

CREATE POLICY "Maintenance staff can update assigned complaints" ON public.complaints
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'maintenance_staff') 
    AND assigned_to = auth.uid()
  );

-- Complaint updates policies
CREATE POLICY "Users can view updates for accessible complaints" ON public.complaint_updates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.complaints c
      WHERE c.id = complaint_id
      AND (
        c.submitted_by = auth.uid()
        OR c.assigned_to = auth.uid()
        OR public.has_role(auth.uid(), 'admin')
        OR public.has_role(auth.uid(), 'principal')
        OR (public.has_role(auth.uid(), 'hod') AND c.department_id = public.get_user_department(auth.uid()))
      )
    )
  );

CREATE POLICY "Authorized users can add updates" ON public.complaint_updates
  FOR INSERT WITH CHECK (auth.uid() = updated_by);

-- Auto-generate complaint number function
CREATE OR REPLACE FUNCTION public.generate_complaint_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  year_part TEXT;
  sequence_num INT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(complaint_number FROM 9) AS INT)), 0) + 1
  INTO sequence_num
  FROM public.complaints
  WHERE complaint_number LIKE 'UC-' || year_part || '-%';
  
  NEW.complaint_number := 'UC-' || year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_complaint_number
  BEFORE INSERT ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_complaint_number();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert default departments
INSERT INTO public.departments (name, code) VALUES
  -- Engineering & Technology - Computer & IT
('Computer Science Engineering', 'CSE'),
('Artificial Intelligence & Machine Learning', 'AIML'),
('Data Science', 'DS'),
('Cyber Security', 'CYB'),
('Cloud Computing', 'CC'),
('Internet of Things', 'IOT'),
('Software Engineering', 'SE'),
('Information Technology', 'IT'),
('Computer Applications', 'CA'),
('Blockchain Technology', 'BLK'),
('Quantum Computing', 'QC'),
('Game Development', 'GD'),
('Full Stack Development', 'FSD'),
('Mobile Application Development', 'MAD'),

-- Core Engineering
('Mechanical Engineering', 'ME'),
('Civil Engineering', 'CE'),
('Electrical Engineering', 'EE'),
('Electronics Engineering', 'ELE'),
('Electronics & Communication Engineering', 'ECE'),
('Instrumentation Engineering', 'IE'),
('Mechatronics Engineering', 'MECH'),
('Chemical Engineering', 'CHE'),
('Metallurgical Engineering', 'MET'),
('Mining Engineering', 'MIN'),
('Petroleum Engineering', 'PET'),
('Marine Engineering', 'MAR'),
('Industrial Engineering', 'INDENG'),
('Production Engineering', 'PROD'),

-- Advanced / Specialized Engineering
('Aerospace Engineering', 'AERO'),
('Aeronautical Engineering', 'AERON'),
('Robotics Engineering', 'ROB'),
('Automation Engineering', 'AUTOM'),
('Nanotechnology Engineering', 'NANO'),
('Biomedical Engineering', 'BIOMED'),
('Environmental Engineering', 'ENVENG'),
('Energy Engineering', 'ENE'),
('Nuclear Engineering', 'NUC'),
('Automotive Engineering', 'AUTOMOT'),

-- Science & Applied Science - Pure Sciences
('Physics', 'PHY'),
('Chemistry', 'CHEM'),
('Mathematics', 'MATH'),
('Statistics', 'STAT'),
('Pure Mathematics', 'PMATH'),
('Applied Mathematics', 'AMATH'),

-- Life Sciences
('Biology', 'BIOL'),
('Microbiologys', 'MICROL'),
('Biotechnology', 'BIOTECH'),
('Genetics', 'GEN'),
('Biochemistry', 'BIOCHEM'),
('Zoology', 'ZOO'),
('Botany', 'BOT'),
('Molecular Biology', 'MOLBIO'),
('Neuroscience', 'NEURO'),
('Bioinformatics', 'BIOINFO'),

-- Earth & Environmental Sciences
('Environmental Science', 'ENVSCI'),
('Geology', 'GEO'),
('Geography', 'GEOG'),
('Geophysics', 'GEOPHY'),
('Oceanography', 'OCEAN'),
('Atmospheric Science', 'ATMOS'),
('Climate Science', 'CLIM'),
('Disaster Management', 'DISM'),

-- Medical & Health Sciences - Medical
('MBBS', 'MBBS'),
('MD / MS', 'MDMS'),
('Anatomy', 'ANAT'),
('Physiology', 'PHYSIOL'),
('Pathology', 'PATH'),
('Pharmacologys', 'PHARMAC'),
('Microbiology', 'MICROM'),
('Community Medicine', 'COMM'),
('Forensic Medicine', 'FORENSIC'),

-- Allied Health Sciences
('Nursing', 'NURS'),
('Physiotherapy', 'PHYSIO'),
('Occupational Therapy', 'OT'),
('Radiology & Imaging Technology', 'RAD'),
('Medical Laboratory Technology', 'MLT'),
('Operation Theatre Technology', 'OTT'),
('Dialysis Technology', 'DIAL'),
('Optometry', 'OPTO'),
('Audiology & Speech Therapy', 'AUD'),

-- Pharmacy
('Pharmacy', 'PHARMA'),
('Clinical Pharmacy', 'CLINPHARM'),
('Pharmaceutical Chemistry', 'PHARMCHEM'),
('Pharmacognosy', 'PHARMCOG'),
('Pharmacology', 'PHARMACL'),

-- Agriculture & Allied Sciences
('Agriculture', 'AGRI'),
('Horticulture', 'HORT'),
('Forestry', 'FOR'),
('Agronomy', 'AGRON'),
('Soil Science', 'SOIL'),
('Agricultural Economics', 'AGRECON'),
('Agricultural Engineering', 'AGRENG'),
('Seed Technology', 'SEED'),
('Food Technology', 'FOOD'),
('Dairy Technology', 'DAIRY'),
('Fisheries Science', 'FISH'),
('Animal Husbandry', 'ANIMH'),
('Veterinary Science', 'VET'),
('Sericulture', 'SERI'),

-- Commerce, Management & Business - Commerce
('Commerce', 'COMMERCE'),
('Accounting', 'ACC'),
('Auditing', 'AUDIT'),
('Taxation', 'TAX'),
('Banking', 'BANK'),
('Finance', 'FIN'),
('Cost & Management Accounting', 'CMA'),

-- Management
('Business Administration', 'BBA'),
('Human Resource Management', 'HRM'),
('Marketing Management', 'MKT'),
('Finance Management', 'FINM'),
('Operations Management', 'OPS'),
('International Business', 'IB'),
('Entrepreneurship', 'ENT'),
('Supply Chain Management', 'SCM'),
('Logistics Management', 'LOG'),
('Hospital Management', 'HM'),
('Event Management', 'EM'),
('Retail Management', 'RM'),
('Tourism & Travel Management', 'TTM'),

-- Law & Legal Studies
('Law', 'LAW'),
('Constitutional Law', 'CONLAW'),
('Criminal Law', 'CRIMLAW'),
('Civil Law', 'CIVLAW'),
('Corporate Law', 'CORPLAW'),
('Cyber Law', 'CYBERLAW'),
('International Law', 'INTLAW'),
('Intellectual Property Rights', 'IPR'),
('Environmental Law', 'ENVLAW'),
('Human Rights Law', 'HRLAW'),
('Maritime Law', 'MARLAW'),

-- Arts, Humanities & Social Sciences - Arts & Humanities
('English Literature', 'ENG'),
('Hindi', 'HIN'),
('Sanskrit', 'SAN'),
('Regional Languages', 'REG'),
('Linguistics', 'LING'),
('Philosophy', 'PHIL'),
('History', 'HIST'),
('Political Science', 'POLSCI'),
('Sociology', 'SOC'),
('Psychology', 'PSY'),
('Economics', 'ECONARTS'),
('Anthropology', 'ANTH'),
('Archaeology', 'ARCH'),
('Cultural Studies', 'CULT'),
('Public Administration', 'PUBADM'),

-- Performing & Fine Arts
('Music', 'MUS'),
('Dance', 'DAN'),
('Theatre & Drama', 'THEATRE'),
('Fine Arts', 'FINE'),
('Painting', 'PAINT'),
('Sculpture', 'SCULP'),
('Visual Arts', 'VISUAL'),

-- Media, Design & Communication
('Journalism', 'JOUR'),
('Mass Communication', 'MASSCOMM'),
('Media Studies', 'MEDIA'),
('Advertising', 'ADV'),
('Public Relations', 'PR'),
('Digital Media', 'DIGMEDIA'),
('Film Studies', 'FILM'),
('Cinematography', 'CINEMA'),
('Animation & VFX', 'ANIMVFX'),
('Graphic Design', 'GRAPH'),
('UI/UX Design', 'UIUX'),
('Fashion Design', 'FASH'),
('Textile Design', 'TEXT'),
('Interior Design', 'INT'),
('Industrial Design', 'INDDES'),

-- Education & Teacher Training
('Education', 'EDU'),
('Teacher Training', 'TTRAIN'),
('Educational Psychology', 'EDUPSY'),
('Special Education', 'SPED'),
('Curriculum & Instruction', 'CURR'),
('Early Childhood Education', 'ECEDU'),
('Educational Technology', 'EDTECH'),

-- Economics, Policy & Governance
('Economic', 'ECONPOL'),
('Development Studies', 'DEV'),
('Public Policy', 'POLICY'),
('International Relations', 'IR'),
('Strategic Studies', 'STRAT'),
('Defence Studies', 'DEF'),
('Governance Studies', 'GOV'),

-- Research & Interdisciplinary Studies
('Research Methodology', 'RESMETH'),
('Innovation & Entrepreneurship', 'INNOV'),
('Interdisciplinary Studies', 'INTER'),
('Integrated Sciences', 'INTSCI'),
('Data Analytics', 'DATAANAL'),
('Computational Sciences', 'COMP'),
('Artificial Intelligence Research', 'AIRES'),
('Space Science Research', 'SPACERES'),

-- Vocational & Skill-Based Studies
('Skill Development', 'SKILL'),
('Industrial Training', 'INDTRAIN'),
('Electrician', 'ELEC'),
('Fitter', 'FIT'),
('Welder', 'WELD'),
('Mechanic', 'MECHAN'),
('Automobile Technology', 'AUTOTECH'),
('CNC Technology', 'CNC'),
('Refrigeration & AC', 'REF'),
('Construction Technology', 'CONST'),

-- Emerging & Future Technologies
('Artificial Intelligence', 'AI'),
('Machine Learning', 'ML'),
('Robotics', 'ROBOT'),
('Blockchain', 'BLOCK'),
('Web3', 'WEB3'),
('Augmented Reality', 'AR'),
('Virtual Reality', 'VR'),
('Mixed Reality', 'MR'),
('Quantum Technology', 'QUANT'),
('Space Technology', 'SPACE'),
('Ethical Hacking', 'ETHACK'),
('Digital Forensics', 'DIGFOR'),

-- Multidisciplinary / Integrated Programs
('Integrated B.Tech + M.Tech', 'INTBTECH'),
('Integrated B.Sc + M.Sc', 'INTBSC'),
('Integrated BA + LLB', 'INTBALLB'),
('Integrated BBA + LLB', 'INTBBALLB'),
('Integrated MBA', 'INTMBA'),
('Liberal Arts', 'LIBARTS'),
('Interdisciplinary Sciences', 'INTERSCI');

-- Insert sample maintenance categories
INSERT INTO public.maintenance_categories (name, description, icon) VALUES
('Electrical', 'Electrical system repairs and maintenance', 'zap'),
('Plumbing', 'Water supply, drainage, and plumbing issues', 'droplets'),
('Carpentry', 'Woodwork, furniture, and structural repairs', 'hammer'),
('Painting', 'Interior and exterior painting services', 'paintbrush'),
('HVAC', 'Heating, ventilation, and air conditioning', 'fan'),
('IT Support', 'Computer and network related issues', 'monitor'),
('Cleaning', 'General cleaning and sanitation', 'broom'),
('Security', 'Security system and access control', 'shield'),
('Landscaping', 'Garden and outdoor maintenance', 'leaf'),
('Roofing', 'Roof repairs and maintenance', 'home'),
('Flooring', 'Floor repairs and maintenance', 'grid'),
('Lighting', 'Lighting system repairs', 'lightbulb'),
('Doors/Windows', 'Door and window repairs', 'door'),
('Elevator', 'Elevator maintenance and repairs', 'arrow-up-down'),
('Fire Safety', 'Fire alarm and safety equipment', 'flame'),
('Sanitation', 'Waste management and sanitation', 'trash'),
('Pest Control', 'Pest management services', 'bug'),
('General Maintenance', 'Other maintenance issues', 'wrench');

-- Insert default maintenance categories
INSERT INTO public.maintenance_categories (name, description, icon) VALUES
  ('Classroom Maintenance', 'Lighting, fans, projectors, AC, furniture', 'School'),
  ('Department Maintenance', 'Office equipment, printers, Wi-Fi', 'Building2'),
  ('Laboratory Maintenance', 'Lab instruments, safety equipment, software', 'FlaskConical'),
  ('Washroom & Hygiene', 'Water supply, drainage, sanitation', 'Bath'),
  ('Campus Infrastructure', 'Roads, parking, gardens, lighting', 'TreePine'),
  ('Safety & Security', 'CCTV, fire safety, access control', 'ShieldAlert'),
  ('Utilities & Services', 'Lifts, generators, water tanks, solar', 'Zap');

-- Insert buildings data
INSERT INTO public.buildings (name, category) VALUES
-- Engineering & Technology Blocks
('Computer Science & IT Block', 'Engineering & Technology Blocks'),
('Artificial Intelligence & Data Science Block', 'Engineering & Technology Blocks'),
('Electronics & Communication Engineering Block', 'Engineering & Technology Blocks'),
('Electrical Engineering Block', 'Engineering & Technology Blocks'),
('Mechanical Engineering Block', 'Engineering & Technology Blocks'),
('Civil Engineering Block', 'Engineering & Technology Blocks'),
('Chemical Engineering Block', 'Engineering & Technology Blocks'),
('Robotics & Automation Block', 'Engineering & Technology Blocks'),
('Mechatronics Block', 'Engineering & Technology Blocks'),
('Aerospace & Aeronautical Block', 'Engineering & Technology Blocks'),
('Biomedical Engineering Block', 'Engineering & Technology Blocks'),
('Nanotechnology Block', 'Engineering & Technology Blocks'),
('Environmental Engineering Block', 'Engineering & Technology Blocks'),
('Energy Engineering Block', 'Engineering & Technology Blocks'),
('Automotive Engineering Block', 'Engineering & Technology Blocks'),
('Mining & Metallurgy Block', 'Engineering & Technology Blocks'),
('Petroleum Engineering Block', 'Engineering & Technology Blocks'),
('Marine Engineering Block', 'Engineering & Technology Blocks'),
-- Science Blocks
('Physics Block', 'Science Blocks'),
('Chemistry Block', 'Science Blocks'),
('Mathematics Block', 'Science Blocks'),
('Statistics Block', 'Science Blocks'),
('Life Sciences Block', 'Science Blocks'),
('Biotechnology Block', 'Science Blocks'),
('Microbiology Blocke', 'Science Blocks'),
('Biochemistry Block', 'Science Blocks'),
('Genetics Block', 'Science Blocks'),
('Zoology Block', 'Science Blocks'),
('Botany Block', 'Science Blocks'),
('Environmental Science Block', 'Science Blocks'),
('Earth Sciences Block', 'Science Blocks'),
('Geology Block', 'Science Blocks'),
('Geography Block', 'Science Blocks'),
('Oceanography Block', 'Science Blocks'),
('Climate & Atmospheric Sciences Block', 'Science Blocks'),
-- Medical & Health Sciences Buildings
('Medical College Building', 'Medical & Health Sciences Buildings'),
('Teaching Hospital', 'Medical & Health Sciences Buildings'),
('Anatomy Block', 'Medical & Health Sciences Buildings'),
('Physiology Block', 'Medical & Health Sciences Buildings'),
('Pathology Block', 'Medical & Health Sciences Buildings'),
('Pharmacology Block', 'Medical & Health Sciences Buildings'),
('Microbiology Block', 'Medical & Health Sciences Buildings'),
('Community Medicine Block', 'Medical & Health Sciences Buildings'),
('Forensic Medicine Block', 'Medical & Health Sciences Buildings'),
('Nursing College Building', 'Medical & Health Sciences Buildings'),
('Pharmacy Block', 'Medical & Health Sciences Buildings'),
('Physiotherapy Block', 'Medical & Health Sciences Buildings'),
('Allied Health Sciences Block', 'Medical & Health Sciences Buildings'),
('Diagnostic & Imaging Centre', 'Medical & Health Sciences Buildings'),
('Research Medical Labs', 'Medical & Health Sciences Buildings'),
('Medical Simulation Centre', 'Medical & Health Sciences Buildings'),
('Animal Research Facility', 'Medical & Health Sciences Buildings'),
-- Agriculture & Veterinary Buildings
('Agriculture Sciences Block', 'Agriculture & Veterinary Buildings'),
('Agronomy Block', 'Agriculture & Veterinary Buildings'),
('Horticulture Block', 'Agriculture & Veterinary Buildings'),
('Forestry Block', 'Agriculture & Veterinary Buildings'),
('Soil Science Block', 'Agriculture & Veterinary Buildings'),
('Seed Technology Building', 'Agriculture & Veterinary Buildings'),
('Food Processing Building', 'Agriculture & Veterinary Buildings'),
('Dairy Technology Building', 'Agriculture & Veterinary Buildings'),
('Fisheries Sciences Block', 'Agriculture & Veterinary Buildings'),
('Animal Husbandry Block', 'Agriculture & Veterinary Buildings'),
('Veterinary College Building', 'Agriculture & Veterinary Buildings'),
('Veterinary Hospital', 'Agriculture & Veterinary Buildings'),
('Poultry Farm', 'Agriculture & Veterinary Buildings'),
('Greenhouses & Polyhouses', 'Agriculture & Veterinary Buildings'),
-- Management, Commerce & Economics
('School of Business & Management', 'Management, Commerce & Economics'),
('Commerce & Accounting Block', 'Management, Commerce & Economics'),
('Economics & Policy Studies Block', 'Management, Commerce & Economics'),
('Entrepreneurship & Innovation Building', 'Management, Commerce & Economics'),
('Incubation Centre', 'Management, Commerce & Economics'),
('Startup Hub', 'Management, Commerce & Economics'),
('Business Analytics Centre', 'Management, Commerce & Economics'),
('Trading & Finance Lab', 'Management, Commerce & Economics'),
-- Law, Humanities & Social Sciences
('Law School Building', 'Law, Humanities & Social Sciences'),
('Moot Court Complex', 'Law, Humanities & Social Sciences'),
('Legal Aid Centre', 'Law, Humanities & Social Sciences'),
('Humanities Block', 'Law, Humanities & Social Sciences'),
('Arts & Languages Block', 'Law, Humanities & Social Sciences'),
('Social Sciences Block', 'Law, Humanities & Social Sciences'),
('Psychology Block', 'Law, Humanities & Social Sciences'),
('Philosophy Block', 'Law, Humanities & Social Sciences'),
('History & Cultural Studies Block', 'Law, Humanities & Social Sciences'),
('Political Science & Public Administration Block', 'Law, Humanities & Social Sciences'),
-- Design, Media & Creative Arts
('Architecture & Planning Block', 'Design, Media & Creative Arts'),
('Fine Arts Building', 'Design, Media & Creative Arts'),
('Visual Communication Block', 'Design, Media & Creative Arts'),
('Design Studio Complex', 'Design, Media & Creative Arts'),
('Fashion & Textile Design Block', 'Design, Media & Creative Arts'),
('Animation & VFX Studio', 'Design, Media & Creative Arts'),
('Film & Media Production Building', 'Design, Media & Creative Arts'),
('Photography Studio', 'Design, Media & Creative Arts'),
('Sound & Recording Studios', 'Design, Media & Creative Arts'),
('Performing Arts Theatre', 'Design, Media & Creative Arts'),
-- RESEARCH & INNOVATION BUILDINGS
('Central Research Facility', 'RESEARCH & INNOVATION BUILDINGS'),
('Advanced Research Labs Complex', 'RESEARCH & INNOVATION BUILDINGS'),
('Interdisciplinary Research Building', 'RESEARCH & INNOVATION BUILDINGS'),
('AI & Robotics Research Centre', 'RESEARCH & INNOVATION BUILDINGS'),
('Biotechnology Research Centre', 'RESEARCH & INNOVATION BUILDINGS'),
('Space Science & Satellite Lab', 'RESEARCH & INNOVATION BUILDINGS'),
('Defence Research Facility', 'RESEARCH & INNOVATION BUILDINGS'),
('Nanofabrication Facility', 'RESEARCH & INNOVATION BUILDINGS'),
('High-Performance Computing Centre', 'RESEARCH & INNOVATION BUILDINGS'),
('Intellectual Property & Patent Office', 'RESEARCH & INNOVATION BUILDINGS'),
('Innovation & Startup Research Park', 'RESEARCH & INNOVATION BUILDINGS'),
('Sponsored Research Office', 'RESEARCH & INNOVATION BUILDINGS'),
-- TEACHING & LEARNING FACILITIES
('Lecture Hall Complex', 'TEACHING & LEARNING FACILITIES'),
('Smart Classroom Building', 'TEACHING & LEARNING FACILITIES'),
('Tutorial Rooms Block', 'TEACHING & LEARNING FACILITIES'),
('Seminar Hall Complex', 'TEACHING & LEARNING FACILITIES'),
('Conference Centre', 'TEACHING & LEARNING FACILITIES'),
('Auditorium', 'TEACHING & LEARNING FACILITIES'),
('Open-Air Amphitheatre', 'TEACHING & LEARNING FACILITIES'),
('Examination Hall', 'TEACHING & LEARNING FACILITIES'),
('Digital Learning Centre', 'TEACHING & LEARNING FACILITIES'),
('E-Learning Studio', 'TEACHING & LEARNING FACILITIES'),
-- LIBRARIES & KNOWLEDGE CENTRES
('Central Library', 'LIBRARIES & KNOWLEDGE CENTRES'),
('Departmental Libraries', 'LIBRARIES & KNOWLEDGE CENTRES'),
('Digital Library', 'LIBRARIES & KNOWLEDGE CENTRES'),
('Research Scholars Library', 'LIBRARIES & KNOWLEDGE CENTRES'),
('Archives & Manuscript Centre', 'LIBRARIES & KNOWLEDGE CENTRES'),
('Reading Hall', 'LIBRARIES & KNOWLEDGE CENTRES'),
('Knowledge Resource Centre', 'LIBRARIES & KNOWLEDGE CENTRES'),
-- STUDENT FACILITIES BUILDINGS
('Student Activity Centre', 'STUDENT FACILITIES BUILDINGS'),
('Student Union Building', 'STUDENT FACILITIES BUILDINGS'),
('Career Development & Placement Cell', 'STUDENT FACILITIES BUILDINGS'),
('Counseling & Wellness Centre', 'STUDENT FACILITIES BUILDINGS'),
('International Students Office', 'STUDENT FACILITIES BUILDINGS'),
('Alumni Relations Office', 'STUDENT FACILITIES BUILDINGS'),
('NSS / NCC Building', 'STUDENT FACILITIES BUILDINGS'),
('Innovation Club House', 'STUDENT FACILITIES BUILDINGS'),
('Co-curricular Activity Block', 'STUDENT FACILITIES BUILDINGS'),
-- RESIDENTIAL & ACCOMMODATION BUILDINGS
('Boys Hostel', 'RESIDENTIAL & ACCOMMODATION BUILDINGS'),
('Girls Hostel', 'RESIDENTIAL & ACCOMMODATION BUILDINGS'),
('Research Scholars Hostel', 'RESIDENTIAL & ACCOMMODATION BUILDINGS'),
('International Students Hostel', 'RESIDENTIAL & ACCOMMODATION BUILDINGS'),
('Married Students Hostel', 'RESIDENTIAL & ACCOMMODATION BUILDINGS'),
('Short-Term Guest Hostel', 'RESIDENTIAL & ACCOMMODATION BUILDINGS'),
('Faculty Quarters', 'RESIDENTIAL & ACCOMMODATION BUILDINGS'),
('Staff Quarters', 'RESIDENTIAL & ACCOMMODATION BUILDINGS'),
('Visiting Faculty Residences', 'RESIDENTIAL & ACCOMMODATION BUILDINGS'),
('University Guest House', 'RESIDENTIAL & ACCOMMODATION BUILDINGS'),
('VIP Guest House', 'RESIDENTIAL & ACCOMMODATION BUILDINGS'),
-- HEALTH, SAFETY & WELLNESS
('University Health Centre', 'HEALTH, SAFETY & WELLNESS'),
('Emergency Medical Unit', 'HEALTH, SAFETY & WELLNESS'),
('Mental Health & Wellness Centre', 'HEALTH, SAFETY & WELLNESS'),
('Pharmacy Store', 'HEALTH, SAFETY & WELLNESS'),
('Isolation Facility', 'HEALTH, SAFETY & WELLNESS'),
('Disaster Management Centre', 'HEALTH, SAFETY & WELLNESS'),
('Fire Safety & Emergency Response Unit', 'HEALTH, SAFETY & WELLNESS'),
-- SPORTS & RECREATION FACILITIES
('Indoor Sports Complex', 'SPORTS & RECREATION FACILITIES'),
('Outdoor Sports Complex', 'SPORTS & RECREATION FACILITIES'),
('Gymnasium', 'SPORTS & RECREATION FACILITIES'),
('Swimming Pool', 'SPORTS & RECREATION FACILITIES'),
('Athletic Track & Field', 'SPORTS & RECREATION FACILITIES'),
('Football Ground', 'SPORTS & RECREATION FACILITIES'),
('Cricket Stadium', 'SPORTS & RECREATION FACILITIES'),
('Basketball Courts', 'SPORTS & RECREATION FACILITIES'),
('Tennis Courts', 'SPORTS & RECREATION FACILITIES'),
('Badminton Hall', 'SPORTS & RECREATION FACILITIES'),
('Yoga & Meditation Centre', 'SPORTS & RECREATION FACILITIES'),
('Fitness & Wellness Pavilion', 'SPORTS & RECREATION FACILITIES'),
-- FOOD & COMMERCIAL FACILITIES
('Central Canteen', 'FOOD & COMMERCIAL FACILITIES'),
('Food Court', 'FOOD & COMMERCIAL FACILITIES'),
('Cafeterias', 'FOOD & COMMERCIAL FACILITIES'),
('Staff Dining Hall', 'FOOD & COMMERCIAL FACILITIES'),
('Student Mess Buildings', 'FOOD & COMMERCIAL FACILITIES'),
('Bakery & Food Production Unit', 'FOOD & COMMERCIAL FACILITIES'),
('Convenience Stores', 'FOOD & COMMERCIAL FACILITIES'),
('Bookstore & Stationery Shop', 'FOOD & COMMERCIAL FACILITIES'),
('ATM & Banking Complex', 'FOOD & COMMERCIAL FACILITIES'),
('Post Office', 'FOOD & COMMERCIAL FACILITIES'),
('Courier Centre', 'FOOD & COMMERCIAL FACILITIES'),
-- ADMINISTRATIVE & GOVERNANCE BUILDINGS
('Administrative Block', 'ADMINISTRATIVE & GOVERNANCE BUILDINGS'),
('Vice-Chancellor Office', 'ADMINISTRATIVE & GOVERNANCE BUILDINGS'),
('Registrar Office', 'ADMINISTRATIVE & GOVERNANCE BUILDINGS'),
('Academic Council Building', 'ADMINISTRATIVE & GOVERNANCE BUILDINGS'),
('Examination & Evaluation Office', 'ADMINISTRATIVE & GOVERNANCE BUILDINGS'),
('Finance & Accounts Office', 'ADMINISTRATIVE & GOVERNANCE BUILDINGS'),
('HR & Establishment Office', 'ADMINISTRATIVE & GOVERNANCE BUILDINGS'),
('Legal Cell', 'ADMINISTRATIVE & GOVERNANCE BUILDINGS'),
('Grievance Redressal Office', 'ADMINISTRATIVE & GOVERNANCE BUILDINGS'),
('Public Relations Office', 'ADMINISTRATIVE & GOVERNANCE BUILDINGS'),
-- INFRASTRUCTURE & UTILITIES
('Central Utility Building', 'INFRASTRUCTURE & UTILITIES'),
('Power Substation', 'INFRASTRUCTURE & UTILITIES'),
('Solar Energy Plant', 'INFRASTRUCTURE & UTILITIES'),
('Generator Building', 'INFRASTRUCTURE & UTILITIES'),
('Water Treatment Plant', 'INFRASTRUCTURE & UTILITIES'),
('Sewage Treatment Plant', 'INFRASTRUCTURE & UTILITIES'),
('Rainwater Harvesting Unit', 'INFRASTRUCTURE & UTILITIES'),
('Waste Management Facility', 'INFRASTRUCTURE & UTILITIES'),
('E-Waste Disposal Centre', 'INFRASTRUCTURE & UTILITIES'),
('Network & Data Centre', 'INFRASTRUCTURE & UTILITIES'),
('IT Services Building', 'INFRASTRUCTURE & UTILITIES'),
-- TRANSPORT & ACCESS
('Main Gate Complex', 'TRANSPORT & ACCESS'),
('Security Control Room', 'TRANSPORT & ACCESS'),
('Transport Office', 'TRANSPORT & ACCESS'),
('Bus Depot', 'TRANSPORT & ACCESS'),
('Parking Structures', 'TRANSPORT & ACCESS'),
('Bicycle Parking', 'TRANSPORT & ACCESS'),
('Electric Vehicle Charging Station', 'TRANSPORT & ACCESS'),
('Internal Shuttle Station', 'TRANSPORT & ACCESS'),
-- RELIGIOUS & CULTURAL FACILITIES
('Multi-Faith Prayer Hall', 'RELIGIOUS & CULTURAL FACILITIES'),
('Temple', 'RELIGIOUS & CULTURAL FACILITIES'),
('Mosque', 'RELIGIOUS & CULTURAL FACILITIES'),
('Church', 'RELIGIOUS & CULTURAL FACILITIES'),
('Meditation Hall', 'RELIGIOUS & CULTURAL FACILITIES'),
('Spiritual & Cultural Centre', 'RELIGIOUS & CULTURAL FACILITIES'),
-- ECOLOGY & OPEN SPACES
('Botanical Garden', 'ECOLOGY & OPEN SPACES'),
('Herbal Garden', 'ECOLOGY & OPEN SPACES'),
('Biodiversity Park', 'ECOLOGY & OPEN SPACES'),
('Greenhouses', 'ECOLOGY & OPEN SPACES'),
('Open Lawns', 'ECOLOGY & OPEN SPACES'),
('Lake / Water Bodies', 'ECOLOGY & OPEN SPACES'),
('Forest Area', 'ECOLOGY & OPEN SPACES'),
('Eco-Park', 'ECOLOGY & OPEN SPACES'),
-- MAINTENANCE & SUPPORT FACILITIES
('Maintenance Workshop', 'MAINTENANCE & SUPPORT FACILITIES'),
('Engineering Services Building', 'MAINTENANCE & SUPPORT FACILITIES'),
('Stores & Inventory Building', 'MAINTENANCE & SUPPORT FACILITIES'),
('Housekeeping Office', 'MAINTENANCE & SUPPORT FACILITIES'),
('Security Barracks', 'MAINTENANCE & SUPPORT FACILITIES'),
('Lost & Found Office', 'MAINTENANCE & SUPPORT FACILITIES');
  