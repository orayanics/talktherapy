import { describe, expect, it } from 'vitest'
import { toUser } from './auth-client'

describe('Laravel identity resource mapping', () => {
  it('maps verified active accounts without exposing server-only fields', () => {
    expect(toUser({
      id: 'user-1', name: 'Member', email: 'member@example.com',
      email_verified_at: '2026-10-28T00:00:00.000Z', role: 'patient', status: 'active',
      image: null, created_at: '2026-10-28T00:00:00.000Z', updated_at: '2026-10-28T00:00:00.000Z',
    })).toMatchObject({
      id: 'user-1', emailVerified: true, role: 'patient', banned: false,
    })
  })

  it('maps suspended and unverified state explicitly', () => {
    expect(toUser({
      id: 'user-2', name: 'Member', email: 'member@example.com',
      email_verified_at: '', role: 'admin', status: 'suspended', image: null,
      created_at: '2026-10-28T00:00:00.000Z', updated_at: '2026-10-28T00:00:00.000Z',
    })).toMatchObject({ emailVerified: false, banned: true })
  })
})
