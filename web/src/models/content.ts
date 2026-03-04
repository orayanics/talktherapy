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
