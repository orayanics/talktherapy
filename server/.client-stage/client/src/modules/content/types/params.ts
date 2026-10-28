export interface ContentParams {
    search?: string
    diagnosis?: Array<string>
    sort?: 'asc' | 'desc' | string
    is_bookmarked?: boolean
}
