export interface NotificationDto {
  id: string
  type: string
  title: string
  message: string
  entity_type: 'appointment' | 'export' | null
  entity_id: string | null
  read_at: string | null
  created_at: string
}

export interface NotificationListMeta {
  total: number
  page: number
  per_page: number
  last_page: number
  unread: number
}

export interface NotificationListDto {
  data: Array<NotificationDto>
  meta: NotificationListMeta
}

// WebSocket server-push message shapes
export type NotificationWsMessage =
  | { type: 'notification'; payload: NotificationDto }
  | { type: 'unread_count'; count: number }
