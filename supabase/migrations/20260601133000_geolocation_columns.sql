-- Add Geolocation columns to complaints table
ALTER TABLE public.complaints
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION NULL,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION NULL;

-- Comment describing the columns
COMMENT ON COLUMN public.complaints.latitude IS 'Latitude coordinate of where the complaint was filed on campus.';
COMMENT ON COLUMN public.complaints.longitude IS 'Longitude coordinate of where the complaint was filed on campus.';
