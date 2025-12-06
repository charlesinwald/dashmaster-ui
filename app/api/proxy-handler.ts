import { NextRequest, NextResponse } from 'next/server';

const EXPRESS_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export async function proxyRequest(
  request: NextRequest,
  basePath: string,
  subPath: string[] = []
) {
  const path = subPath.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${EXPRESS_API_URL}${basePath}${path ? `/${path}` : ''}${searchParams ? `?${searchParams}` : ''}`;

  try {
    const options: RequestInit = {
      method: request.method,
      headers: { 'Content-Type': 'application/json' },
    };

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const body = await request.text();
      if (body) {
        options.body = body;
      }
    }

    const response = await fetch(url, options);
    const data = await response.text();

    try {
      return NextResponse.json(JSON.parse(data), { status: response.status });
    } catch {
      return new NextResponse(data, { status: response.status });
    }
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to backend API' },
      { status: 500 }
    );
  }
}
