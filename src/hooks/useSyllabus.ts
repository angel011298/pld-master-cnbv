// src/hooks/useSyllabus.ts
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Usamos el cliente estándar de Supabase para lectura pública
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type SyllabusModule = {
  module: string;
  topics: string[];
};

export function useSyllabus() {
  const [syllabus, setSyllabus] = useState<SyllabusModule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSyllabus() {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('payload')
          .eq('key_name', 'cnbv_syllabus')
          .single();

        if (error) throw error;
        
        if (data && data.payload) {
          setSyllabus(data.payload as SyllabusModule[]);
        }
      } catch (err) {
        console.error("Error fetching syllabus from Supabase:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSyllabus();
  }, []);

  return { syllabus, loading };
}