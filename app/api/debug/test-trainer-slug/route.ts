// app/api/debug/test-trainer-slug/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    const slug = 'elena-smirnova';

    // Тестируем поиск по slug
    const slugResponse = await fetch(`${convexUrl}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: 'trainers:getBySlug',
        args: { slug: slug }
      })
    });

    let slugResult = null;
    let slugError = null;

    if (slugResponse.ok) {
      const slugData = await slugResponse.json();
      slugResult = slugData.value;
    } else {
      slugError = await slugResponse.text();
    }

    return NextResponse.json({
      success: true,
      debug: {
        slug: slug,
        found: !!slugResult,
        error: slugError,
        trainerData: slugResult ? {
          id: slugResult._id,
          name: slugResult.name,
          email: slugResult.email
        } : null
      }
    });

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
