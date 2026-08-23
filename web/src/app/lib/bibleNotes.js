import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkHtml from 'remark-html'

const CONTENT_ROOT = path.join(process.cwd(), 'content', 'bible-notes')

/**
 * Pre-process Pandoc-style semantic markup for remark.
 * [text]{.class}       → <span class="kt-class">text</span>
 * ::: {.name}...:::    → <div class="kt-callout kt-callout-name">...</div>
 */
export function preprocessSemantic(markdown) {
  let out = markdown

  out = out.replace(
    /^:::\s*\{?\.([a-z0-9-]+)\}?\s*\n([\s\S]*?)^:::\s*$/gm,
    (_m, name, content) =>
      `<div class="kt-callout kt-callout-${name}">\n\n${content}\n\n</div>`,
  )

  out = out.replace(
    /\[([^\]]+)\]\{\.([a-z0-9-]+)\}/g,
    (_m, text, cls) => `<span class="kt-${cls}">${text}</span>`,
  )

  return out
}

function detectCategory(relPath) {
  if (relPath.startsWith('ghi-chu')) return 'ghi-chu'
  if (relPath.startsWith('loi-thoai')) return 'loi-thoai'
  if (relPath.startsWith('tom-tat')) return 'tom-tat'
  return null
}

function walkFiles(dir, rootLen) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name.includes('.bak')) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...walkFiles(full, rootLen))
    } else if (entry.name.endsWith('.md')) {
      out.push(full.slice(rootLen + 1).replace(/\\/g, '/'))
    }
  }
  return out
}

export function listNoteMeta() {
  if (!fs.existsSync(CONTENT_ROOT)) return []
  const files = walkFiles(CONTENT_ROOT, CONTENT_ROOT.length)
  const notes = []
  for (const rel of files) {
    if (rel === 'SPEC.md') continue
    const category = detectCategory(rel)
    if (!category) continue
    const raw = fs.readFileSync(path.join(CONTENT_ROOT, rel), 'utf8')
    const parsed = matter(raw)
    const slug = path.basename(rel, '.md')
    notes.push({
      slug,
      category,
      path: rel,
      frontmatter: parsed.data,
    })
  }
  notes.sort((a, b) => a.slug.localeCompare(b.slug))
  return notes
}

export async function loadNote(slug) {
  const all = listNoteMeta()
  const meta = all.find(n => n.slug === slug)
  if (!meta) return null
  const raw = fs.readFileSync(path.join(CONTENT_ROOT, meta.path), 'utf8')
  const parsed = matter(raw)
  const preprocessed = preprocessSemantic(parsed.content)
  const processed = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(preprocessed)
  return {
    ...meta,
    frontmatter: parsed.data,
    html: String(processed),
  }
}

export function listAllSlugs() {
  return listNoteMeta().map(n => n.slug)
}
