import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing supabase env vars");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspectBuildings() {
  const { data: buildings, error } = await supabase
    .from('buildings')
    .select('*')
    .order('category')
    .order('name');

  if (error) {
    console.error('Error fetching buildings:', error);
    return;
  }

  console.log(`Total buildings in DB: ${buildings?.length}`);
  
  const categories = {};
  buildings?.forEach(b => {
    const cat = b.category || 'Uncategorized';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(b.name);
  });

  for (const [cat, items] of Object.entries(categories)) {
    console.log(`\n### ${cat} (${items.length}):`);
    items.forEach(name => console.log(`  - ${name}`));
  }
}

inspectBuildings();
