import {
  agents,
  conversations,
  knowledge,
  leads,
} from "@/app/lib/store";

export async function GET() {
  return Response.json({
    conversations: conversations.length,
    aiResolved: 0,
    humanHandoffs: 0,
    leadsCaptured: leads.length,
    knowledgeItems: knowledge.length,
    agents: agents.length,
    activeAgents: agents.filter((agent) => agent.status === "active").length,
  });
}
