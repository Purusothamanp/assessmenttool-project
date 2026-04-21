import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/apiConfig";

async function handleRequest(
  request: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await context.params;
    const path = slug.join("/");

    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();

    const backendUrl = `${API_BASE_URL}/${path}${
      searchParams ? `?${searchParams}` : ""
    }`;

    // ✅ Copy headers safely
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      if (!["host", "connection"].includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    });

    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
      cache: "no-store",
    };

    // ✅ Handle body safely
    if (!["GET", "HEAD"].includes(request.method)) {
      const contentType = request.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        fetchOptions.body = JSON.stringify(await request.json());
      } else {
        fetchOptions.body = await request.text();
      }
    }

    const response = await fetch(backendUrl, fetchOptions);

    const contentType = response.headers.get("content-type");

    // ✅ Return EXACT backend response (not always JSON)
    if (contentType?.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } else {
      const text = await response.text();
      return new NextResponse(text, { status: response.status });
    }

  } catch (error: any) {
    console.error("Proxy error:", error);

    return NextResponse.json(
      {
        error: "Backend service unavailable",
        details: error.message,
      },
      { status: 502 }
    );
  }
}

// ✅ Export handlers
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;