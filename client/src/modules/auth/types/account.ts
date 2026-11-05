import type { ROLE_VALUES, STATUS_VALUES } from '../constants/account'

export type USER_ROLE = (typeof ROLE_VALUES)[number]
export type ACCOUNT_STATUS = (typeof STATUS_VALUES)[number]
