import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { fetchCurrentUser, primaryRoleHome } from "@/lib/current-user";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    const cu = await fetchCurrentUser();
    throw redirect({ to: primaryRoleHome(cu?.roles ?? []) });
  },
  component: () => null,
});
