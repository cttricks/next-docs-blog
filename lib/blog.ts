import { promises as fs } from 'fs'
import path from 'path'

const CONTENT_ROOT =
  process.env.CONTENT_ROOT || '/var/blog-content'

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

export function isValidSlug(slug: string): boolean {
  const validSlugPattern = /^[a-zA-Z0-9_-]+$/

  if (!validSlugPattern.test(slug)) return false
  if (slug.includes('..') || slug.includes('/') || slug.includes('\\'))
    return false

  return true
}

export function getArticlePath(slug: string): string {
  if (!isValidSlug(slug)) {
    throw new Error('Invalid slug')
  }

  const articlePath = path.resolve(CONTENT_ROOT, slug)
  const contentRoot = path.resolve(CONTENT_ROOT)

  if (!articlePath.startsWith(contentRoot)) {
    throw new Error('Invalid path')
  }

  return articlePath
}

export async function articleExists(slug: string): Promise<boolean> {
  try {
    const stats = await fs.stat(getArticlePath(slug))
    return stats.isDirectory()
  } catch {
    return false
  }
}

export async function readArticleContent(slug: string): Promise<string> {
  const contentPath = path.join(
    getArticlePath(slug),
    'content.html'
  )

  return fs.readFile(contentPath, 'utf-8')
}

export async function readArticleMetadata(
  slug: string
): Promise<BlogMetadata> {
  const metaPath = path.join(
    getArticlePath(slug),
    'meta.json'
  )

  const raw = await fs.readFile(metaPath, 'utf-8')
  const metadata = JSON.parse(raw) as BlogMetadata

  if (!metadata.title || !metadata.description) {
    throw new Error('Missing required metadata fields')
  }

  return metadata
}

export async function getArticle(
  slug: string
): Promise<BlogContent> {
  const [html, metadata] = await Promise.all([
    readArticleContent(slug),
    readArticleMetadata(slug),
  ])

  return { html, metadata }
}
