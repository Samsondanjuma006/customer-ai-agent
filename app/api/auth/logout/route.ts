import { createClient } from "@/app/lib/supabase-server";

export async function POST() {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 400 },
      );
    }

    return Response.json({
      message: "Signed out successfully",
    });
  } catch {
    return Response.json(
      { error: "Unable to sign out" },
      { status: 500 },
    );
  }
}
