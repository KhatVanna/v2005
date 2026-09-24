import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const maxDuration = 30;

const API_ORIGIN = process.env.LARAVEL_API_ORIGIN ?? "http://127.0.0.1:8000";
const TOKEN_COOKIE = "v2005_admin_token";
const ADMIN_ROLES = new Set(["super-admin", "admin", "staff"]);
const UPSTREAM_TIMEOUT_MS = 25_000;

type AuthUser = {
  roles?: Array<{ slug: string }>;
};

type AuthSuccess = {
  success: true;
  message: string;
  data: {
    user: AuthUser;
    token: string;
    token_type: string;
  };
};

function laravelUrl(path: string) {
  return `${API_ORIGIN}/api/v1${path}`;
}

function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

function clearAuthCookie(response: NextResponse) {
  response.cookies.set(TOKEN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

function hasAdminRole(user: AuthUser) {
  return Boolean(user.roles?.some((role) => ADMIN_ROLES.has(role.slug)));
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  let upstream: Response;
  try {
    upstream = await fetch(laravelUrl("/auth/login"), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...body,
        portal: "admin",
      }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message:
          "Laravel API unreachable (timeout). Check Railway service health and LARAVEL_API_ORIGIN.",
      },
      { status: 503 }
    );
  }

  const payload = (await upstream.json()) as AuthSuccess | {
    success: false;
    message: string;
    errors?: Record<string, string[]>;
  };

  if (!upstream.ok || !payload.success) {
    return NextResponse.json(payload, { status: upstream.status });
  }

  if (!hasAdminRole(payload.data.user)) {
    return NextResponse.json(
      {
        success: false,
        message: "Only Super Admin, Admin, or Staff accounts can sign in here.",
        errors: {
          email: ["Only Super Admin, Admin, or Staff accounts can sign in here."],
        },
      },
      { status: 403 }
    );
  }

  const response = NextResponse.json({
    success: true,
    message: payload.message,
    data: {
      user: payload.data.user,
    },
  });

  setAuthCookie(response, payload.data.token);
  return response;
}

export async function DELETE(request: NextRequest) {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;

  if (token) {
    await fetch(laravelUrl("/auth/logout"), {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  }

  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
    data: null,
  });

  clearAuthCookie(response);
  return response;
}
