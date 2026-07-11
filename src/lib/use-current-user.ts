import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchCurrentUser, type CurrentUser } from "@/lib/current-user";

export function useCurrentUser() {
  return useQuery<CurrentUser | null>({
    queryKey: ["current-user"],
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60_000,
  });
}

export async function signOutAndGo(navigate: (opts: { to: string; replace?: boolean }) => void) {
  await supabase.auth.signOut();
  navigate({ to: "/auth", replace: true });
}
