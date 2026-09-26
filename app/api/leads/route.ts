import { createClient } from "@/app/lib/supabase-server";

async function getUserBusiness(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: membership, error: membershipError } = await supabase
    .from("business_members")
    .select("business_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (membershipError || !membership) {
    return null;
  }

  return membership.business_id;
}

export async function GET() {
  const supabase = await createClient();
  const businessId = await getUserBusiness(supabase);

  if (!businessId) {
    return Response.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json(
      { error: error.message },
      { status: 500 },
    );
  }

  return Response.json({ leads: data });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const contact = String(body.contact || "").trim();
    const interest = String(body.interest || "").trim();

    if (!name || !contact) {
      return Response.json(
        { error: "Name and contact are required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const businessId = await getUserBusiness(supabase);

    if (!businessId) {
      return Response.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const { data: lead, error } = await supabase
      .from("leads")
      .insert({
        business_id: businessId,
        name,
        contact,
        interest,
        status: "new",
      })
      .select()
      .single();

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 500 },
      );
    }

    return Response.json({ lead }, { status: 201 });
  } catch {
    return Response.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const id = String(body.id || "").trim();
    const status = body.status;

    if (!id || !["new", "contacted", "converted"].includes(status)) {
      return Response.json(
        { error: "Valid lead id and status are required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const businessId = await getUserBusiness(supabase);

    if (!businessId) {
      return Response.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const { data: lead, error } = await supabase
      .from("leads")
      .update({ status })
      .eq("id", id)
      .eq("business_id", businessId)
      .select()
      .single();

    if (error || !lead) {
      return Response.json(
        { error: error?.message || "Lead not found" },
        { status: 404 },
      );
    }

    return Response.json({ lead });
  } catch {
    return Response.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
