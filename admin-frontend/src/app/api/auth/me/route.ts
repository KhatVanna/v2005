import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const API_ORIGIN = process.env.LARAVEL_API_ORIGIN ?? "http://127.0.0.1:8000";
const TOKEN_COOKIE = "v2005_admin_token";
const ADMIN_ROLES = new Set(["super-admin", "admin", "staff"]);

type AuthUser = {
  roles?: Array<{ slug: string }>;
};

export async function GET(request: NextRequest) {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthenticated",
      },
      { status: 401 }
    );
  }

  try {
    const upstream = await fetch(`${API_ORIGIN}/api/v1/auth/me`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    let payload: unknown = null;
    try {
      payload = await upstream.json();
    } catch {
      payload = {
        success: false,
        message: "Invalid auth response from API",
      };
    }

    if (!upstream.ok) {
      const response = NextResponse.json(payload, { status: upstream.status });
      // Only clear the cookie on a real unauthorized response.
      if (upstream.status === 401) {
        response.cookies.set(TOKEN_COOKIE, "", {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          maxAge: 0,
        });
      }
      return response;
    }

    const user = (payload as { data?: { user?: AuthUser } })?.data?.user;
    const isAdminUser = Boolean(
      user?.roles?.some((role) => ADMIN_ROLES.has(role.slug))
    );

    if (!isAdminUser) {
      const response = NextResponse.json(
        {
          success: false,
          message:
            "Only Super Admin, Admin, or Staff accounts can use the admin portal.",
        },
        { status: 403 }
      );
      response.cookies.set(TOKEN_COOKIE, "", {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
      return response;
    }

    return NextResponse.json(payload);
  } catch {
    // Keep the cookie on transient API/network failures (common during hot reload).
    return NextResponse.json(
      {
        success: false,
        message: "Authentication service temporarily unavailable",
      },
      { status: 503 }
    );
  }
}
