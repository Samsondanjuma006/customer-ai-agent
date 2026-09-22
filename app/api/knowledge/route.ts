import { knowledge } from "@/app/lib/store";

export async function GET() {
  return Response.json({ knowledge });
}

export async function POST(request: Request) {
  const body = await request.json();

  const title = String(body.title || "").trim();
  const type = String(body.type || "business").trim();
  const content = String(body.content || "").trim();

  if (!title || !content) {
    return Response.json(
      { error: "Title and content are required" },
      { status: 400 }
    );
  }

  const item = {
    id: crypto.randomUUID(),
    title,
    type,
    content,
    createdAt: new Date().toISOString(),
  };

  knowledge.push(item);

  return Response.json({ item }, { status: 201 });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const id = String(body.id || "").trim();

  const index = knowledge.findIndex((item) => item.id === id);

  if (index === -1) {
    return Response.json({ error: "Knowledge item not found" }, { status: 404 });
  }

  knowledge.splice(index, 1);

  return Response.json({ success: true });
}
