import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/apiConfig';

/**
 * Generic catch-all API proxy route.
 * Forwards requests from /api/[...path] to ${API_BASE_URL}/[...path]
 */

async function handleRequest(request: Request, { params }: { params: { slug: string[] } }) {
  try {
    const slug = (await params).slug;
    const path = slug.join('/');
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    
    // Construct the backend URL
    const backendUrl = `${API_BASE_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;
    
    // Determine which headers to forward
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      // Avoid forwarding host or other problematic headers
      if (!['host', 'connection'].includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    });

    const fetchOptions: RequestInit = {
      method: request.method,
      headers: headers,
      cache: 'no-store'
    };

    // Include body for non-GET/HEAD methods
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      const contentType = request.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        fetchOptions.body = JSON.stringify(await request.json());
      } else {
        // Handle other body types if necessary, or just skip
      }
    }

    const response = await fetch(backendUrl, fetchOptions);
    const contentType = response.headers.get('content-type');
    
    let responseData;
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    return NextResponse.json(responseData, { status: response.status });

  } catch (error: any) {
    console.error(`Proxy error for ${request.method} ${request.url}:`, error);
    return NextResponse.json(
      { error: 'Backend service unavailable', details: error.message },
      { status: 502 }
    );
  }
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
