import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const API_ORIGIN = process.env.LARAVEL_API_ORIGIN ?? "http://127.0.0.1:8000";
const TOKEN_COOKIE = "v2005_token";
const STORE_ROLE = "customer";

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

function hasStoreRole(user: AuthUser) {
  return Boolean(user.roles?.some((role) => role.slug === STORE_ROLE));
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const upstream = await fetch(laravelUrl("/auth/login"), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...body,
      portal: "store",
    }),
  });

  const payload = (await upstream.json()) as AuthSuccess | {
    success: false;
    message: string;
    errors?: Record<string, string[]>;
  };

  if (!upstream.ok || !payload.success) {
    return NextResponse.json(payload, { status: upstream.status });
  }

  if (!hasStoreRole(payload.data.user)) {
    return NextResponse.json(
      {
        success: false,
        message: "Only customer accounts can sign in to the store.",
        errors: {
          email: ["Only customer accounts can sign in to the store."],
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
