import { getAuthenticatedUser } from "@/app/lib/auth";

export async function GET() {
  try {
    const { user, business } = await getAuthenticatedUser();

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

    return Response.json({
      business,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch {
    return Response.json(
      { error: "Unable to load business information" },
      { status: 500 },
    );
  }
}
