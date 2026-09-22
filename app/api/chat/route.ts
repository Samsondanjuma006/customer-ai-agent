import { agents, conversations, knowledge } from "@/app/lib/store";

function findRelevantKnowledge(message: string, agentId: string) {
  const words = message
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 2);

  return knowledge
    .filter((item) => item.agentId === agentId)
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

  const items = agentId
    ? conversations.filter((item) => item.agentId === agentId)
    : conversations;

  return Response.json({ conversations: items });
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

    const agent = agents.find((item) => item.id === agentId);

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

    const relevantKnowledge = findRelevantKnowledge(message, agentId);

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

    const conversation = {
      id: crypto.randomUUID(),
      agentId,
      message,
      reply,
      createdAt: new Date().toISOString(),
    };

    conversations.push(conversation);

    return Response.json({ conversation }, { status: 201 });
  } catch {
    return Response.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
