import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const API_ORIGIN = process.env.LARAVEL_API_ORIGIN ?? "http://127.0.0.1:8000";
const TOKEN_COOKIE = "v2005_token";
const STORE_ROLE = "customer";

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
    const isCustomer = Boolean(user?.roles?.some((role) => role.slug === STORE_ROLE));

    if (!isCustomer) {
      const response = NextResponse.json(
        {
          success: false,
          message: "Only customer accounts can use the storefront.",
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
    return NextResponse.json(
      {
        success: false,
        message: "Authentication service temporarily unavailable",
      },
      { status: 503 }
    );
  }
}
