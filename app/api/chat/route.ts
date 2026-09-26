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

function findRelevantKnowledge(
  message: string,
  knowledge: Array<{
    id: string;
    title: string;
    content: string;
  }>,
) {
  const words = message
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 2);

  return knowledge
    .map((item) => {
      const text = `${item.title} ${item.content}`.toLowerCase();

      const score = words.reduce(
        (total, word) => total + (text.includes(word) ? 1 : 0),
        0,
      );

      return { item, score };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((result) => result.item);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get("agentId");

  if (!agentId) {
    return Response.json(
      { error: "Agent ID is required" },
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

  const { data: agent, error: agentError } = await supabase
    .from("agents")
    .select("id")
    .eq("id", agentId)
    .eq("business_id", businessId)
    .maybeSingle();

  if (agentError) {
    return Response.json({ error: agentError.message }, { status: 500 });
  }

  if (!agent) {
    return Response.json(
      { error: "Agent not found" },
      { status: 404 },
    );
  }

  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("agent_id", agentId)
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const conversations = data.map((item) => ({
    id: item.id,
    agentId: item.agent_id,
    message: item.message,
    reply: item.reply,
    createdAt: item.created_at,
  }));

  return Response.json({ conversations });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const agentId = String(body.agentId || "").trim();
    const message = String(body.message || "").trim();

    if (!agentId) {
      return Response.json(
        { error: "Agent ID is required" },
        { status: 400 },
      );
    }

    if (!message) {
      return Response.json(
        { error: "Message is required" },
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

    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("id, name, status")
      .eq("id", agentId)
      .eq("business_id", businessId)
      .maybeSingle();

    if (agentError) {
      return Response.json({ error: agentError.message }, { status: 500 });
    }

    if (!agent) {
      return Response.json(
        { error: "Agent not found" },
        { status: 404 },
      );
    }

    if (agent.status !== "active") {
      return Response.json(
        { error: "This AI agent is inactive" },
        { status: 400 },
      );
    }

    const { data: knowledge, error: knowledgeError } = await supabase
      .from("knowledge_items")
      .select("id, title, content")
      .eq("agent_id", agentId);

    if (knowledgeError) {
      return Response.json(
        { error: knowledgeError.message },
        { status: 500 },
      );
    }

    const relevantKnowledge = findRelevantKnowledge(message, knowledge || []);

    let reply: string;

    if (relevantKnowledge.length === 0) {
      reply =
        "I don't have enough information in this AI agent's knowledge base to answer that question yet. Please add relevant business information or contact a member of the team.";
    } else {
      const sources = relevantKnowledge
        .map((item) => `• ${item.title}: ${item.content}`)
        .join("\n");

      reply =
        `Based on the business information available to me:\n\n${sources}\n\n` +
        "If you need more help, I can connect you with a member of the team.";
    }

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        agent_id: agentId,
        message,
        reply,
      })
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    const conversation = {
      id: data.id,
      agentId: data.agent_id,
      message: data.message,
      reply: data.reply,
      createdAt: data.created_at,
    };

    return Response.json({ conversation }, { status: 201 });
  } catch {
    return Response.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
