import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { isValidSlug } from '@/lib/blog'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    
    // Validate required fields
    if (!body.slug) {
      return NextResponse.json(
        { success: false, error: 'Missing slug parameter' },
        { status: 400 }
      )
    }
    
    const { slug, secret } = body
    
    // Optional: Verify secret token for security
    const revalidateSecret = process.env.REVALIDATE_SECRET
    if (revalidateSecret && secret !== revalidateSecret) {
      return NextResponse.json(
        { success: false, error: 'Invalid secret' },
        { status: 401 }
      )
    }
    
    // Validate slug
    if (!isValidSlug(slug)) {
      return NextResponse.json(
        { success: false, error: 'Invalid slug format' },
        { status: 400 }
      )
    }
    
    // Revalidate the specific blog page
    revalidatePath(`/blogs/${slug}`)
    
    return NextResponse.json({
      success: true,
      message: `Successfully revalidated /blogs/${slug}`,
      revalidated: true,
      now: Date.now(),
    })
    
  } catch (error) {
    console.error('Revalidation error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to revalidate',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Optional: GET endpoint for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Revalidation endpoint is working. Use POST with { "slug": "article-slug", "secret": "your-secret" }',
    method: 'POST',
    requiredFields: ['slug'],
    optionalFields: ['secret'],
  })
}
