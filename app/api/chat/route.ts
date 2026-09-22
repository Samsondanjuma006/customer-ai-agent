import { conversations } from "@/app/lib/store";

export async function GET() {
  return Response.json({ conversations });
}

export async function POST(request: Request) {
  const body = await request.json();

  const message = String(body.message || "").trim();

  if (!message) {
    return Response.json(
      { error: "Message is required" },
      { status: 400 }
    );
  }

  const reply =
    "Your message was received. The AI response engine will be connected in the next stage.";

  const conversation = {
    id: crypto.randomUUID(),
    message,
    reply,
    createdAt: new Date().toISOString(),
  };

  conversations.push(conversation);

  return Response.json({ conversation }, { status: 201 });
}
