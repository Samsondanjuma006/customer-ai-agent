import { getAuthenticatedUser } from "@/app/lib/auth";

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

    const { data: agents, error: agentsError } = await supabase
      .from("agents")
      .select("id, status")
      .eq("business_id", business.id);

    if (agentsError) {
      return Response.json(
        { error: agentsError.message },
        { status: 500 },
      );
    }

    const agentIds = (agents || []).map((agent) => agent.id);

    let conversationsCount = 0;
    let knowledgeItemsCount = 0;

    if (agentIds.length > 0) {
      const { count: conversationCount, error: conversationError } =
        await supabase
          .from("conversations")
          .select("id", { count: "exact", head: true })
          .in("agent_id", agentIds);

      if (conversationError) {
        return Response.json(
          { error: conversationError.message },
          { status: 500 },
        );
      }

      conversationsCount = conversationCount || 0;

      const { count: knowledgeCount, error: knowledgeError } =
        await supabase
          .from("knowledge_items")
          .select("id", { count: "exact", head: true })
          .in("agent_id", agentIds);

      if (knowledgeError) {
        return Response.json(
          { error: knowledgeError.message },
          { status: 500 },
        );
      }

      knowledgeItemsCount = knowledgeCount || 0;
    }

    const { count: leadsCount, error: leadsError } = await supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("business_id", business.id);

    if (leadsError) {
      return Response.json(
        { error: leadsError.message },
        { status: 500 },
      );
    }

    return Response.json({
      conversations: conversationsCount,
      aiResolved: 0,
      humanHandoffs: 0,
      leadsCaptured: leadsCount || 0,
      knowledgeItems: knowledgeItemsCount,
      agents: agents?.length || 0,
      activeAgents:
        agents?.filter((agent) => agent.status === "active").length || 0,
    });
  } catch {
    return Response.json(
      { error: "Unable to load statistics" },
      { status: 500 },
    );
  }
}
