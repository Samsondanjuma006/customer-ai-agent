import { createClient } from "@/app/lib/supabase-server";

export async function getAuthenticatedUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      supabase,
      user: null,
      business: null,
    };
  }

  const { data: membership } = await supabase
    .from("business_members")
    .select("business_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    return {
      supabase,
      user,
      business: null,
    };
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", membership.business_id)
    .maybeSingle();

  return {
    supabase,
    user,
    business,
  };
}
