import { getAuthenticatedUser } from "@/app/lib/auth";

function formatAgent(agent: {
  id: string;
  name: string;
  description: string | null;
  status: string;
  created_at: string;
}) {
  return {
    id: agent.id,
    name: agent.name,
    description: agent.description || "",
    status: agent.status,
    createdAt: agent.created_at,
  };
}

export async function GET() {
  try {
    const { user, business, supabase } = await getAuthenticatedUser();

    if (!user) {
      return Response.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    if (!business) {
      return Response.json(
        { error: "Business workspace not found" },
        { status: 404 },
      );
    }

    const { data, error } = await supabase
      .from("agents")
      .select("*")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false });

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 500 },
      );
    }

    return Response.json({
      agents: data.map(formatAgent),
    });
  } catch {
    return Response.json(
      { error: "Unable to load agents" },
      { status: 500 },
    );
  }
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

    const { user, business, supabase } = await getAuthenticatedUser();

    if (!user) {
      return Response.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    if (!business) {
      return Response.json(
        { error: "Business workspace not found" },
        { status: 404 },
      );
    }

    const { data, error } = await supabase
      .from("agents")
      .insert({
        business_id: business.id,
        name,
        description,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 500 },
      );
    }

    return Response.json(
      { agent: formatAgent(data) },
      { status: 201 },
    );
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

    const { user, business, supabase } = await getAuthenticatedUser();

    if (!user) {
      return Response.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    if (!business) {
      return Response.json(
        { error: "Business workspace not found" },
        { status: 404 },
      );
    }

    const { data, error } = await supabase
      .from("agents")
      .update({ status })
      .eq("id", id)
      .eq("business_id", business.id)
      .select()
      .single();

    if (error || !data) {
      return Response.json(
        { error: error?.message || "Agent not found" },
        { status: 404 },
      );
    }

    return Response.json({
      agent: formatAgent(data),
    });
  } catch {
    return Response.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
