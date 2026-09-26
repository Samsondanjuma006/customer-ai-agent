import { getAuthenticatedUser } from "@/app/lib/auth";

function formatKnowledgeItem(item: {
  id: string;
  agent_id: string;
  title: string;
  type: string;
  content: string;
  created_at: string;
}) {
  return {
    id: item.id,
    agentId: item.agent_id,
    title: item.title,
    type: item.type,
    content: item.content,
    createdAt: item.created_at,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("agentId");

    if (!agentId) {
      return Response.json(
        { error: "Agent ID is required" },
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

    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("id")
      .eq("id", agentId)
      .eq("business_id", business.id)
      .maybeSingle();

    if (agentError) {
      return Response.json(
        { error: agentError.message },
        { status: 500 },
      );
    }

    if (!agent) {
      return Response.json(
        { error: "Agent not found" },
        { status: 404 },
      );
    }

    const { data, error } = await supabase
      .from("knowledge_items")
      .select("*")
      .eq("agent_id", agentId)
      .order("created_at", { ascending: false });

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 500 },
      );
    }

    return Response.json({
      knowledge: data.map(formatKnowledgeItem),
    });
  } catch {
    return Response.json(
      { error: "Unable to load knowledge" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const agentId = String(body.agentId || "").trim();
    const title = String(body.title || "").trim();
    const type = String(body.type || "business").trim();
    const content = String(body.content || "").trim();

    if (!agentId) {
      return Response.json(
        { error: "Agent ID is required" },
        { status: 400 },
      );
    }

    if (!title || !content) {
      return Response.json(
        { error: "Title and content are required" },
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

    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("id")
      .eq("id", agentId)
      .eq("business_id", business.id)
      .maybeSingle();

    if (agentError) {
      return Response.json(
        { error: agentError.message },
        { status: 500 },
      );
    }

    if (!agent) {
      return Response.json(
        { error: "Agent not found" },
        { status: 404 },
      );
    }

    const { data, error } = await supabase
      .from("knowledge_items")
      .insert({
        agent_id: agentId,
        title,
        type,
        content,
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
      { item: formatKnowledgeItem(data) },
      { status: 201 },
    );
  } catch {
    return Response.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const id = String(body.id || "").trim();

    if (!id) {
      return Response.json(
        { error: "Knowledge item ID is required" },
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

    const { data: item, error: itemError } = await supabase
      .from("knowledge_items")
      .select("id, agent_id")
      .eq("id", id)
      .maybeSingle();

    if (itemError) {
      return Response.json(
        { error: itemError.message },
        { status: 500 },
      );
    }

    if (!item) {
      return Response.json(
        { error: "Knowledge item not found" },
        { status: 404 },
      );
    }

    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("id")
      .eq("id", item.agent_id)
      .eq("business_id", business.id)
      .maybeSingle();

    if (agentError) {
      return Response.json(
        { error: agentError.message },
        { status: 500 },
      );
    }

    if (!agent) {
      return Response.json(
        { error: "Knowledge item not found" },
        { status: 404 },
      );
    }

    const { error } = await supabase
      .from("knowledge_items")
      .delete()
      .eq("id", id);

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 500 },
      );
    }

    return Response.json({ success: true });
  } catch {
    return Response.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
