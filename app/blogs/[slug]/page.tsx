import { notFound } from 'next/navigation'
import { getArticle, articleExists, isValidSlug } from '@/lib/blog'
import type { Metadata } from 'next'

// Enable ISR with 1 hour revalidation
export const revalidate = 3600

interface BlogPageProps {
  params: {
    slug: string
  }
}

/**
 * Generate metadata for SEO and Open Graph
 */
export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { slug } = params
  
  // Validate slug
  if (!isValidSlug(slug)) {
    return {
      title: 'Invalid Article',
    }
  }
  
  // Check if article exists
  const exists = await articleExists(slug)
  if (!exists) {
    return {
      title: 'Article Not Found: ' + slug,
    }
  }
  
  try {
    const { metadata } = await getArticle(slug)
    
    return {
      title: metadata.title,
      description: metadata.description,
      openGraph: {
        title: metadata.ogTitle || metadata.title,
        description: metadata.ogDescription || metadata.description,
        images: metadata.ogImage ? [metadata.ogImage] : [],
        type: 'article',
        publishedTime: metadata.publishedAt,
        authors: metadata.author ? [metadata.author] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: metadata.ogTitle || metadata.title,
        description: metadata.ogDescription || metadata.description,
        images: metadata.ogImage ? [metadata.ogImage] : [],
      },
    }
  } catch (error) {
    return {
      title: 'Error Loading Article',
    }
  }
}

/**
 * Blog article page - Server Component
 */
export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = params
  
  // Validate slug to prevent directory traversal
  if (!isValidSlug(slug)) {
    notFound()
  }
  
  // Check if article exists
  const exists = await articleExists(slug)
  if (!exists) {
    notFound()
  }
  
  // Get article content and metadata
  let article
  try {
    article = await getArticle(slug)
  } catch (error) {
    console.error(`Error loading article ${slug}:`, error)
    notFound()
  }
  
  const { html, metadata } = article
  
  return (
    <>
      <article>
        <header className="article-header">
          <h1>{metadata.title}</h1>
          {metadata.author && (
            <div className="article-meta">
              By {metadata.author}
              {metadata.publishedAt && ` • ${new Date(metadata.publishedAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}`}
            </div>
          )}
        </header>
        
        <div 
          className="article-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
    </>
  )
}
