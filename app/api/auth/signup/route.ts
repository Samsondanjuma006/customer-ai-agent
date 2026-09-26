import { createClient } from "@/app/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body.email || "").trim();
    const password = String(body.password || "");
    const businessName = String(body.businessName || "").trim();

    if (!email || !password || !businessName) {
      return Response.json(
        { error: "Email, password, and business name are required" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return Response.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 400 },
      );
    }

    if (!data.user) {
      return Response.json(
        { error: "Account could not be created" },
        { status: 400 },
      );
    }

    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .insert({
        name: businessName,
        owner_id: data.user.id,
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
        business_id: business.id,
        user_id: data.user.id,
        role: "owner",
      });

    if (memberError) {
      return Response.json(
        { error: memberError.message },
        { status: 400 },
      );
    }

    return Response.json(
      {
        message: "Account created successfully",
        user: {
          id: data.user.id,
          email: data.user.email,
        },
        business,
      },
      { status: 201 },
    );
  } catch {
    return Response.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
