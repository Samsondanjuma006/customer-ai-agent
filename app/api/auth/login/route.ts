import { createClient } from "@/app/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body.email || "").trim();
    const password = String(body.password || "");

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 401 },
      );
    }

    const user = data.user;

    const { data: membership } = await supabase
      .from("business_members")
      .select("business_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    let business = null;

    if (membership) {
      const { data: existingBusiness } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", membership.business_id)
        .maybeSingle();

      business = existingBusiness;
    } else {
      const businessName =
        String(user.user_metadata?.business_name || "").trim() ||
        "My Business";

      const { data: newBusiness, error: businessError } = await supabase
        .from("businesses")
        .insert({
          name: businessName,
          owner_id: user.id,
        })
        .select()
        .single();

      if (businessError) {
        return Response.json(
          { error: businessError.message },
          { status: 400 },
        );
      }

      const { error: memberError } = await supabase
        .from("business_members")
        .insert({
          business_id: newBusiness.id,
          user_id: user.id,
          role: "owner",
        });

      if (memberError) {
        return Response.json(
          { error: memberError.message },
          { status: 400 },
        );
      }

      business = newBusiness;
    }

    return Response.json({
      message: "Signed in successfully",
      user: {
        id: user.id,
        email: user.email,
      },
      business,
    });
  } catch {
    return Response.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
