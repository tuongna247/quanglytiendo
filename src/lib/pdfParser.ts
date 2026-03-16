import * as pdfjsLib from 'pdfjs-dist'

// Point worker to the bundled file via Vite asset URL
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).href

export async function parsePdfToPages(file: File): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  const pages: string[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()

    // Join text items, inserting newlines where items have significant vertical gaps
    let pageText = ''
    let lastY: number | null = null

    for (const item of textContent.items) {
      if (!('str' in item)) continue
      const currentY = (item.transform as number[])[5]
      if (lastY !== null && Math.abs(currentY - lastY) > 5) {
        pageText += '\n'
      }
      pageText += item.str
      lastY = currentY
    }

    pages.push(pageText.trim())
  }

  return pages.filter(p => p.length > 0)
}
