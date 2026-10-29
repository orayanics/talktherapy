export type NotificationItem = {
  id: string
  type: string
  title: string
  message: string
  entity_type: string | null
  entity_id: string | null
  read_at: string | null
  created_at: string
}

export type NotificationPage = {
  data: NotificationItem[]
  links: Record<string, string | null>
  meta: {
    current_page: number
    last_page: number
  }
}
