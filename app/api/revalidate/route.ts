import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { isValidSlug } from '@/lib/blog'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { slug, secret } = body

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Missing slug parameter' },
        { status: 400 }
      )
    }

    const revalidateSecret = process.env.REVALIDATE_SECRET
    if (revalidateSecret && secret !== revalidateSecret) {
      return NextResponse.json(
        { success: false, error: 'Invalid secret' },
        { status: 401 }
      )
    }

    if (!isValidSlug(slug)) {
      return NextResponse.json(
        { success: false, error: 'Invalid slug format' },
        { status: 400 }
      )
    }

    // Invalidate route cache
    revalidatePath(`/blogs/${slug}`)

    return NextResponse.json({
      success: true,
      revalidated: true,
      now: Date.now(),
    })
  } catch (error) {
    console.error('Revalidation error:', error)

    return NextResponse.json(
      { success: false, error: 'Failed to revalidate' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message:
      'Send POST request with { "slug": "article-slug", "secret": "optional-secret" }',
  })
}