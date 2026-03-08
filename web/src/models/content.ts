export interface ContentFormState {
  title: string
  description: string
  bodyValue: string
  diagnosisId: string
  tags: string
}

export interface ContentItem {
  id: string
  title: string
  description: string
  author: { name: string | null; email: string }
  diagnosis: { label: string }
  tags: Array<{ tag: { name: string } }>
}

export interface RawContent {
  title: string
  description: string
  body: string
  diagnosis_id: string
  tags: Array<{ tag: { name: string } }>
}

export interface TagItem {
  id: string
  name: string
  slug: string
}

export interface BookmarkItem {
  id: string
  user_id: string
  content_id: string
  created_at: string
  content: ContentItem & {
    body: string
    author_id: string
    diagnosis_id: string
    created_at: string
    updated_at: string
  }
}

export interface BookmarkListResponse {
  data: Array<BookmarkItem>
  meta: {
    total: number
    page: number
    per_page: number
    last_page: number
    from: number
    to: number
  }
}
