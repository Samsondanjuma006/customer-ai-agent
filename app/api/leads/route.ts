import { leads } from "@/app/lib/store";

export async function GET() {
  return Response.json({ leads });
}

export async function POST(request: Request) {
  const body = await request.json();

  const name = String(body.name || "").trim();
  const contact = String(body.contact || "").trim();
  const interest = String(body.interest || "").trim();

  if (!name || !contact) {
    return Response.json(
      { error: "Name and contact are required" },
      { status: 400 }
    );
  }

  const lead = {
    id: crypto.randomUUID(),
    name,
    contact,
    interest,
    status: "new" as const,
    createdAt: new Date().toISOString(),
  };

  leads.push(lead);

  return Response.json({ lead }, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();

  const id = String(body.id || "").trim();
  const status = body.status;

  if (!id || !["new", "contacted", "converted"].includes(status)) {
    return Response.json(
      { error: "Valid lead id and status are required" },
      { status: 400 }
    );
  }

  const lead = leads.find((item) => item.id === id);

  if (!lead) {
    return Response.json({ error: "Lead not found" }, { status: 404 });
  }

  lead.status = status;

  return Response.json({ lead });
}
