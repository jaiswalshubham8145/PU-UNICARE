import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function checkComplaints() {
  const { data, count, error } = await supabase.from('complaints').select('id, complaint_number, building_id', { count: 'exact' });
  console.log(`Total complaints: ${count}`);
  console.log(`Sample complaints with building_id:`, data?.slice(0, 5));
  
  const buildingIdsInComplaints = new Set(data?.map(c => c.building_id).filter(Boolean));
  console.log(`Unique building_ids referenced in complaints: ${buildingIdsInComplaints.size}`);
}

checkComplaints();
