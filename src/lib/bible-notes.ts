import matter from 'gray-matter'

export interface NoteFrontmatter {
  sach?: string
  ma_sach?: string
  doan?: number
  cau?: string
  tieu_de?: string
  ban_dich?: string
  song_song?: string[]
  chu_de?: string[]
  tu_goc?: string[]
  ngay_soan?: string
  trang_thai?: 'nhap' | 'dang-soan' | 'hoan-tat' | 'da-day'
}

export interface Note {
  slug: string
  category: 'ghi-chu' | 'loi-thoai' | 'tom-tat'
  path: string
  frontmatter: NoteFrontmatter
  body: string
}

const rawModules = import.meta.glob('/src/content/bible-notes/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

function toSlug(filePath: string): string {
  const parts = filePath.split('/')
  const filename = parts[parts.length - 1]?.replace(/\.md$/, '') ?? ''
  return filename
}

function detectCategory(filePath: string): Note['category'] | null {
  if (filePath.includes('/ghi-chu/')) return 'ghi-chu'
  if (filePath.includes('/loi-thoai/')) return 'loi-thoai'
  if (filePath.includes('/tom-tat/')) return 'tom-tat'
  return null
}

export function loadAllNotes(): Note[] {
  const notes: Note[] = []
  for (const [path, raw] of Object.entries(rawModules)) {
    const category = detectCategory(path)
    if (!category) continue
    const parsed = matter(raw)
    notes.push({
      slug: toSlug(path),
      category,
      path,
      frontmatter: parsed.data as NoteFrontmatter,
      body: parsed.content,
    })
  }
  notes.sort((a, b) => a.slug.localeCompare(b.slug))
  return notes
}

export function findNote(slug: string): Note | undefined {
  return loadAllNotes().find(n => n.slug === slug)
}

/**
 * Pre-process Pandoc-style semantic markup for react-markdown.
 * Converts [text]{.class} → <span class="kt-class">text</span>
 * Converts ::: {.class}\n...\n::: → <div class="kt-callout-class">...</div>
 */
export function preprocessSemantic(markdown: string): string {
  let out = markdown

  // Block-level ::: {.name} ... :::
  out = out.replace(
    /^:::\s*\{?\.([a-z0-9-]+)\}?\s*\n([\s\S]*?)^:::\s*$/gm,
    (_m, name, content) => `<div class="kt-callout kt-callout-${name}">\n\n${content}\n\n</div>`,
  )

  // Inline [text]{.class}
  out = out.replace(
    /\[([^\]]+)\]\{\.([a-z0-9-]+)\}/g,
    (_m, text, cls) => `<span class="kt-${cls}">${text}</span>`,
  )

  return out
}
