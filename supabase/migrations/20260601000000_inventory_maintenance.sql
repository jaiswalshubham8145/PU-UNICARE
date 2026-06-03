-- Create Inventory Items Table
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    unit TEXT NOT NULL,
    minimum_stock INTEGER NOT NULL DEFAULT 5,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Inventory Usage Table
CREATE TABLE IF NOT EXISTS public.inventory_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE NOT NULL,
    complaint_id UUID REFERENCES public.complaints(id) ON DELETE SET NULL,
    quantity_used INTEGER NOT NULL,
    used_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Maintenance Windows Table
CREATE TABLE IF NOT EXISTS public.maintenance_windows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS Policies for Inventory Items
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Inventory is viewable by everyone" ON public.inventory_items FOR SELECT USING (true);
CREATE POLICY "Admins, Principals, HODs can insert inventory" ON public.inventory_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'principal', 'hod'))
);
CREATE POLICY "Admins, Principals, HODs can update inventory" ON public.inventory_items FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'principal', 'hod'))
);

-- Add RLS Policies for Inventory Usage
ALTER TABLE public.inventory_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usage is viewable by everyone" ON public.inventory_usage FOR SELECT USING (true);
CREATE POLICY "Staff can insert usage" ON public.inventory_usage FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'maintenance_staff'))
);

-- Add RLS Policies for Maintenance Windows
ALTER TABLE public.maintenance_windows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Maintenance windows are viewable by everyone" ON public.maintenance_windows FOR SELECT USING (true);
CREATE POLICY "Admins, Principals, HODs can manage maintenance windows" ON public.maintenance_windows FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'principal', 'hod'))
);

-- Function to decrement inventory on usage
CREATE OR REPLACE FUNCTION decrement_inventory_on_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.inventory_items
    SET quantity = quantity - NEW.quantity_used
    WHERE id = NEW.item_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_inventory_usage_insert
    AFTER INSERT ON public.inventory_usage
    FOR EACH ROW
    EXECUTE FUNCTION decrement_inventory_on_usage();
