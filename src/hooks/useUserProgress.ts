"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface UserProgress {
  xp: number;
  racha: number;
  leccionesHoy: number;
  cargando: boolean;
}

export function useUserProgress() {
  const [progress, setProgress] = useState<UserProgress>({
    xp: 0,
    racha: 0,
    leccionesHoy: 0,
    cargando: true,
  });

  useEffect(() => {
    async function fetchProgress() {
      try {
        const { data: { user } } = await supabase().auth.getUser();
        if (!user) {
          setProgress((prev) => ({ ...prev, cargando: false }));
          return;
        }

        const sb = supabase();

        // Fetch user profile
        const { data: profile } = await sb
          .from("user_profiles")
          .select("total_xp, current_streak")
          .eq("user_id", user.id)
          .single();

        // Count study events from today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data: studyEvents } = await sb
          .from("study_events")
          .select("id")
          .eq("user_id", user.id)
          .gte("created_at", today.toISOString());

        setProgress({
          xp: profile?.total_xp ?? 0,
          racha: profile?.current_streak ?? 0,
          leccionesHoy: studyEvents?.length ?? 0,
          cargando: false,
        });
      } catch (error) {
        console.error("Error fetching progress:", error);
        setProgress((prev) => ({ ...prev, cargando: false }));
      }
    }

    fetchProgress();
  }, []);

  return progress;
}
