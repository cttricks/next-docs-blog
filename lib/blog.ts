import { promises as fs } from 'fs'
import path from 'path'

// Content root from environment variable
const CONTENT_ROOT = process.env.CONTENT_ROOT || '/var/blog-content'

export interface BlogMetadata {
  title: string
  description: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  author?: string
  publishedAt?: string
}

export interface BlogContent {
  html: string
  metadata: BlogMetadata
}

/**
 * Validates slug to prevent directory traversal attacks
 */
export function isValidSlug(slug: string): boolean {
  // Only allow alphanumeric characters, hyphens, and underscores
  const validSlugPattern = /^[a-zA-Z0-9_-]+$/
  
  if (!validSlugPattern.test(slug)) {
    return false
  }
  
  // Prevent directory traversal
  if (slug.includes('..') || slug.includes('/') || slug.includes('\\')) {
    return false
  }
  
  return true
}

/**
 * Gets the absolute path for an article folder
 */
export function getArticlePath(slug: string): string {
  if (!isValidSlug(slug)) {
    throw new Error('Invalid slug')
  }
  
  // Resolve to absolute path and ensure it's within CONTENT_ROOT
  const articlePath = path.resolve(CONTENT_ROOT, slug)
  const contentRoot = path.resolve(CONTENT_ROOT)

  console.log({ articlePath, contentRoot })
  
  if (!articlePath.startsWith(contentRoot)) {
    throw new Error('Invalid path')
  }
  
  return articlePath
}

/**
 * Checks if an article exists
 */
export async function articleExists(slug: string): Promise<boolean> {
  try {
    const articlePath = getArticlePath(slug)
    const stats = await fs.stat(articlePath)
    return stats.isDirectory()
  } catch {
    return false
  }
}

/**
 * Reads the content.html file for an article
 */
export async function readArticleContent(slug: string): Promise<string> {
  const articlePath = getArticlePath(slug)
  const contentPath = path.join(articlePath, 'content.html')
  
  try {
    const content = await fs.readFile(contentPath, 'utf-8')
    return content
  } catch (error) {
    throw new Error(`Failed to read content.html for ${slug}`)
  }
}

/**
 * Reads the meta.json file for an article
 */
export async function readArticleMetadata(slug: string): Promise<BlogMetadata> {
  const articlePath = getArticlePath(slug)
  const metaPath = path.join(articlePath, 'meta.json')
  
  try {
    const metaContent = await fs.readFile(metaPath, 'utf-8')
    const metadata = JSON.parse(metaContent) as BlogMetadata
    
    // Validate required fields
    if (!metadata.title || !metadata.description) {
      throw new Error('Missing required metadata fields')
    }
    
    return metadata
  } catch (error) {
    throw new Error(`Failed to read meta.json for ${slug}`)
  }
}

/**
 * Reads both content and metadata for an article
 */
export async function getArticle(slug: string): Promise<BlogContent> {
  const [html, metadata] = await Promise.all([
    readArticleContent(slug),
    readArticleMetadata(slug)
  ])
  
  return { html, metadata }
}
