import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const API_ORIGIN = process.env.LARAVEL_API_ORIGIN ?? "http://127.0.0.1:8000";
const TOKEN_COOKIE = "v2005_token";

type AuthSuccess = {
  success: true;
  message: string;
  data: {
    user: unknown;
    token: string;
    token_type: string;
  };
};

function laravelUrl(path: string) {
  return `${API_ORIGIN}/api/v1${path}`;
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const upstream = await fetch(laravelUrl("/auth/register"), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = (await upstream.json()) as AuthSuccess | {
    success: false;
    message: string;
    errors?: Record<string, string[]>;
  };

  if (!upstream.ok || !payload.success) {
    return NextResponse.json(payload, { status: upstream.status });
  }

  const response = NextResponse.json({
    success: true,
    message: payload.message,
    data: {
      user: payload.data.user,
    },
  });

  response.cookies.set(TOKEN_COOKIE, payload.data.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
