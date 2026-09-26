import { createClient } from "@/app/lib/supabase-server";

async function getUserBusiness(
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return null;

  const { data: membership, error: membershipError } = await supabase
    .from("business_members")
    .select("business_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (membershipError || !membership) return null;

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
    .from("agents")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const agents = data.map((agent) => ({
    id: agent.id,
    name: agent.name,
    description: agent.description || "",
    status: agent.status,
    createdAt: agent.created_at,
  }));

  return Response.json({ agents });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const description = String(body.description || "").trim();

    if (!name) {
      return Response.json(
        { error: "Agent name is required" },
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

    const { data, error } = await supabase
      .from("agents")
      .insert({
        business_id: businessId,
        name,
        description,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    const agent = {
      id: data.id,
      name: data.name,
      description: data.description || "",
      status: data.status,
      createdAt: data.created_at,
    };

    return Response.json({ agent }, { status: 201 });
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

    if (!id || !["active", "inactive"].includes(status)) {
      return Response.json(
        { error: "Valid agent id and status are required" },
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

    const { data, error } = await supabase
      .from("agents")
      .update({ status })
      .eq("id", id)
      .eq("business_id", businessId)
      .select()
      .single();

    if (error || !data) {
      return Response.json(
        { error: error?.message || "Agent not found" },
        { status: 404 },
      );
    }

    const agent = {
      id: data.id,
      name: data.name,
      description: data.description || "",
      status: data.status,
      createdAt: data.created_at,
    };

    return Response.json({ agent });
  } catch {
    return Response.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
