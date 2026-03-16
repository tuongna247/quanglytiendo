export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'orange'

export interface EbookBook {
  id: string
  userId: string
  title: string
  pages: string[]
  totalPages: number
  uploadedAt: string
}

export interface EbookHighlight {
  id: string
  userId: string
  bookId: string
  pageNumber: number
  startOffset: number
  endOffset: number
  text: string
  color: HighlightColor
  createdAt: string
}

export interface EbookComment {
  id: string
  userId: string
  bookId: string
  pageNumber: number
  highlightId?: string
  startOffset: number
  endOffset: number
  selectedText: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface EbookBookmark {
  id: string
  userId: string
  bookId: string
  pageNumber: number
  label: string
  createdAt: string
}

export interface EbookProgress {
  id: string
  userId: string
  bookId: string
  currentPage: number
  totalPages: number
  lastReadAt: string
}

export interface SelectionInfo {
  text: string
  startOffset: number
  endOffset: number
  pageNumber: number
  range: Range | null
}
