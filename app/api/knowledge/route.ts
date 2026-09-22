import { knowledge } from "@/app/lib/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get("agentId");

  const items = agentId
    ? knowledge.filter((item) => item.agentId === agentId)
    : knowledge;

  return Response.json({ knowledge: items });
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

    const item = {
      id: crypto.randomUUID(),
      agentId,
      title,
      type,
      content,
      createdAt: new Date().toISOString(),
    };

    knowledge.push(item);

    return Response.json({ item }, { status: 201 });
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

    const index = knowledge.findIndex((item) => item.id === id);

    if (index === -1) {
      return Response.json(
        { error: "Knowledge item not found" },
        { status: 404 },
      );
    }

    knowledge.splice(index, 1);

    return Response.json({ success: true });
  } catch {
    return Response.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
