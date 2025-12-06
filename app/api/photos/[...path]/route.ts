import { NextRequest, NextResponse } from 'next/server';

const EXPRESS_API_URL = 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const fullPath = path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${EXPRESS_API_URL}/api/photos/${fullPath}${searchParams ? `?${searchParams}` : ''}`;

  try {
    const response = await fetch(url);

    // Check if this is an image response
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.startsWith('image/')) {
      // Handle binary image data
      const imageBuffer = await response.arrayBuffer();
      return new NextResponse(imageBuffer, {
        status: response.status,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400',
        },
      });
    } else {
      // Handle JSON responses (list endpoint)
      const data = await response.text();
      try {
        return NextResponse.json(JSON.parse(data), { status: response.status });
      } catch {
        return new NextResponse(data, { status: response.status });
      }
    }
  } catch (error) {
    console.error('Photos proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}
