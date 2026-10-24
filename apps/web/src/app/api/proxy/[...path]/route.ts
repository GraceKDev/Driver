import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ path: string[] }> };

const DEFAULT_API_URL = "http://localhost:8080";
const FORWARDED_REQUEST_HEADERS = [
  "cookie",
  "origin",
  "content-type",
  "accept",
] as const;

function apiBaseUrl(): string {
  return (process.env.API_URL || DEFAULT_API_URL).replace(/\/+$/, "");
}

async function handler(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const encodedPath = path.map((segment) => encodeURIComponent(segment)).join("/");
  const target = new URL(`${apiBaseUrl()}/api/${encodedPath}`);

  request.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.append(key, value);
  });

  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) {
      headers.set(name, value);
    }
  }

  const method = request.method;
  let body: ArrayBuffer | undefined;
  if (method !== "GET" && method !== "HEAD") {
    const buffer = await request.arrayBuffer();
    if (buffer.byteLength > 0) {
      body = buffer;
    }
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method,
      headers,
      body,
      cache: "no-store",
      redirect: "manual",
    });
  } catch {
    return NextResponse.json(
      {
        title: "Could not reach the ChaosDrive API.",
        detail: "The desk is temporarily out of reach. Try again in a moment.",
        status: 502,
      },
      { status: 502 },
    );
  }

  const responseHeaders = new Headers();
  responseHeaders.set("cache-control", "no-store");

  const contentType = upstream.headers.get("content-type");
  if (contentType) {
    responseHeaders.set("content-type", contentType);
  }

  const setCookies =
    typeof upstream.headers.getSetCookie === "function"
      ? upstream.headers.getSetCookie()
      : [];

  if (setCookies.length > 0) {
    for (const cookie of setCookies) {
      responseHeaders.append("set-cookie", cookie);
    }
  } else {
    const cookie = upstream.headers.get("set-cookie");
    if (cookie) {
      responseHeaders.append("set-cookie", cookie);
    }
  }

  if (
    method === "HEAD" ||
    upstream.status === 204 ||
    upstream.status === 304
  ) {
    return new NextResponse(null, {
      status: upstream.status,
      headers: responseHeaders,
    });
  }

  const responseBody = await upstream.arrayBuffer();
  return new NextResponse(responseBody, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export {
  handler as DELETE,
  handler as GET,
  handler as HEAD,
  handler as PATCH,
  handler as POST,
  handler as PUT,
};
