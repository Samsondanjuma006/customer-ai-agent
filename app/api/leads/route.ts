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

    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false });

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 500 },
      );
    }

    return Response.json({ leads: data });
  } catch {
    return Response.json(
      { error: "Unable to load leads" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const contact = String(body.contact || "").trim();
    const interest = String(body.interest || "").trim();

    if (!name || !contact) {
      return Response.json(
        { error: "Name and contact are required" },
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

    const { data: lead, error } = await supabase
      .from("leads")
      .insert({
        business_id: business.id,
        name,
        contact,
        interest,
        status: "new",
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
      { lead },
      { status: 201 },
    );
  } catch {
    return Response.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const id = String(body.id || "").trim();
    const status = body.status;

    if (!id || !["new", "contacted", "converted"].includes(status)) {
      return Response.json(
        { error: "Valid lead id and status are required" },
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

    const { data: lead, error } = await supabase
      .from("leads")
      .update({ status })
      .eq("id", id)
      .eq("business_id", business.id)
      .select()
      .single();

    if (error || !lead) {
      return Response.json(
        { error: error?.message || "Lead not found" },
        { status: 404 },
      );
    }

    return Response.json({ lead });
  } catch {
    return Response.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
