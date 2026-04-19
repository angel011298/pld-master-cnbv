"use client";

import * as React from "react";
import { LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export function AuthControls() {
  const [email, setEmail] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const sb = supabase();
    sb.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: subscription } = sb.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const sb = supabase();
      const callbackUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : undefined;
      await sb.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callbackUrl },
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const sb = supabase();
      await sb.auth.signOut();
    } finally {
      setLoading(false);
    }
  };

  if (email) {
    return (
      <div className="ml-auto flex items-center gap-2">
        <span className="hidden text-xs text-muted-foreground sm:inline">{email}</span>
        <Button variant="outline" size="sm" onClick={signOut} disabled={loading}>
          <LogOut className="mr-1 h-4 w-4" />
          Salir
        </Button>
      </div>
    );
  }

  return (
    <div className="ml-auto">
      <Button size="sm" onClick={signInWithGoogle} disabled={loading}>
        <LogIn className="mr-1 h-4 w-4" />
        Entrar con Google
      </Button>
    </div>
  );
}

