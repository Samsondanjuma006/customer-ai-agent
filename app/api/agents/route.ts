import { agents } from "@/app/lib/store";

export async function GET() {
  return Response.json({ agents });
}

export async function POST(request: Request) {
  const body = await request.json();

  const name = String(body.name || "").trim();
  const description = String(body.description || "").trim();

  if (!name) {
    return Response.json(
      { error: "Agent name is required" },
      { status: 400 }
    );
  }

  const agent = {
    id: crypto.randomUUID(),
    name,
    description,
    status: "active" as const,
    createdAt: new Date().toISOString(),
  };

  agents.push(agent);

  return Response.json({ agent }, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();

  const id = String(body.id || "").trim();
  const status = body.status;

  if (!id || !["active", "inactive"].includes(status)) {
    return Response.json(
      { error: "Valid agent id and status are required" },
      { status: 400 }
    );
  }

  const agent = agents.find((item) => item.id === id);

  if (!agent) {
    return Response.json({ error: "Agent not found" }, { status: 404 });
  }

  agent.status = status;

  return Response.json({ agent });
}
