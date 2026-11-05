import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchUsers } from '#/modules/users/api/users'
import type { AdminUser } from '#/modules/users/types/user'
import { useAdminNotificationComposer } from '#/modules/notifications/api/admin'
import type { BroadcastDraft } from '#/modules/notifications/api/admin'
import FormInput from '#/components/Form/FormInput'
import StateLoading from '#/components/State/StateLoading'
import StateNull from '#/components/State/StateNull'
import { useAlert } from '#/context/AlertContext'

const roles = ['patient', 'clinician', 'admin', 'superadmin'] as const

export default function NotificationComposer() {
  const [mode, setMode] = useState<'users' | 'role'>('users')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedUsers, setSelectedUsers] = useState<Record<string, AdminUser>>(
    {},
  )
  const [selectedRole, setSelectedRole] = useState('')
  const [channels, setChannels] = useState<Array<'in_app' | 'email'>>([
    'in_app',
  ])
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const users = useQuery(
    fetchUsers(
      { page },
      { search: search || undefined, account_status: ['active'] },
    ),
  )
  const { preview, send } = useAdminNotificationComposer()
  const { showAlert } = useAlert()
  const resetPreview = preview.reset
  const resetSend = send.reset
  const visibleUsers = (users.data?.data ?? []).filter(
    (user) => user.email_verified_at,
  )
  const selectedUserIds = useMemo(
    () => Object.keys(selectedUsers),
    [selectedUsers],
  )
  const draft: BroadcastDraft = useMemo(
    () => ({
      recipient_ids: mode === 'users' ? selectedUserIds : undefined,
      roles: mode === 'role' && selectedRole ? [selectedRole] : undefined,
      channels,
      title,
      subject,
      message,
    }),
    [channels, message, mode, selectedRole, selectedUserIds, subject, title],
  )
  const canPreview =
    channels.length > 0 &&
    message.trim().length > 0 &&
    (mode === 'users' ? selectedUserIds.length > 0 : Boolean(selectedRole))

  useEffect(() => {
    resetPreview()
    resetSend()
  }, [draft, resetPreview, resetSend])
  const toggleUser = (user: AdminUser) =>
    setSelectedUsers((current) => {
      const next = { ...current }
      if (user.id in next) delete next[user.id]
      else next[user.id] = user
      return next
    })
  const changeMode = (next: 'users' | 'role') => {
    setMode(next)
    if (next === 'users') setSelectedRole('')
    else setSelectedUsers({})
  }
  const handleSend = async () => {
    try {
      const result = await send.mutateAsync(draft)
      showAlert(`Sent to ${result.data.recipients} recipient(s).`, 'success')
    } catch {
      showAlert('Unable to send notification.', 'error')
    }
  }

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (canPreview) void preview.mutateAsync(draft)
          }}
          className="grid lg:grid-cols-2 gap-4 rounded-box border border-border p-4"
        >
          <fieldset>
            <legend className="mb-2 font-semibold">Recipients</legend>
            <div className="tabs tabs-border w-fit space-x-4">
              <button
                role="tab"
                type="button"
                className={`px-0 tab tabs-border ${mode === 'users' ? 'tab-active' : ''}`}
                onClick={() => changeMode('users')}
              >
                Users
              </button>
              <button
                role="tab"
                type="button"
                className={`tab tabs-border ${mode === 'role' ? 'tab-active' : ''}`}
                onClick={() => changeMode('role')}
              >
                Role
              </button>
            </div>
            {mode === 'role' ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {roles.map((role) => (
                  <label
                    key={role}
                    className="label cursor-pointer justify-start gap-2"
                  >
                    <input
                      type="radio"
                      name="recipient-role"
                      className="radio radio-sm"
                      checked={selectedRole === role}
                      onChange={() => setSelectedRole(role)}
                    />
                    <span className="capitalize">{role}s</span>
                  </label>
                ))}
              </div>
            ) : (
              <>
                {/* Users selection */}
                <FormInput label="Search active users" className="my-2">
                  <input
                    id="notification-user-search"
                    className="input input-bordered w-full"
                    type="search"
                    placeholder="Search active users"
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value)
                      setPage(1)
                    }}
                  />
                </FormInput>
                <div className="max-h-72 overflow-y-auto rounded-box border border-border scrollbar-none [&::-webkit-scrollbar]:hidden">
                  {users.isPending ? (
                    <StateLoading />
                  ) : visibleUsers.length === 0 ? (
                    <StateNull />
                  ) : (
                    <div className="divide-y divide-border">
                      {visibleUsers.map((user) => (
                        <div key={user.id}>
                          <label className="flex cursor-pointer items-center gap-3 p-3 hover:bg-primary/5">
                            <input
                              type="checkbox"
                              className="checkbox checkbox-sm"
                              checked={Boolean(selectedUsers[user.id])}
                              onChange={() => toggleUser(user)}
                            />
                            <span className="min-w-0">
                              <span className="block truncate text-xs font-medium">
                                {user.name}
                              </span>
                              <span className="block truncate text-xs text-muted">
                                {user.email}
                              </span>
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {selectedUserIds.length} selected
                    {users.data?.meta.total
                      ? ` · ${users.data.meta.total} total`
                      : ''}
                  </span>
                  <div className="join">
                    <button
                      type="button"
                      className="btn btn-xs join-item"
                      disabled={page <= 1 || users.isFetching}
                      onClick={() => setPage((current) => current - 1)}
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      className="btn btn-xs join-item"
                      disabled={
                        !users.data?.meta ||
                        page >= users.data.meta.last_page ||
                        users.isFetching
                      }
                      onClick={() => setPage((current) => current + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </fieldset>

          <div className="flex flex-1 flex-col gap-4">
            <fieldset>
              <legend className="mb-2 font-semibold">Channels</legend>
              <div className="flex gap-4">
                {(['in_app', 'email'] as const).map((channel) => (
                  <label key={channel} className="label cursor-pointer gap-2">
                    <input
                      type="checkbox"
                      aria-label={`Send by ${channel === 'in_app' ? 'in-app' : 'email'}`}
                      className="checkbox checkbox-sm"
                      checked={channels.includes(channel)}
                      onChange={() =>
                        setChannels(
                          channels.includes(channel)
                            ? channels.filter((item) => item !== channel)
                            : [...channels, channel],
                        )
                      }
                    />
                    <span>{channel === 'in_app' ? 'In-app' : 'Email'}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {channels.includes('in_app') && (
              <FormInput label="In-app title" required>
                <input
                  id="notification-title"
                  className="input input-bordered w-full"
                  placeholder="In-app title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                />
              </FormInput>
            )}
            {channels.includes('email') && (
              <FormInput label="Email subject" required>
                <input
                  id="notification-subject"
                  className="input input-bordered w-full"
                  placeholder="Email subject"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  required
                />
              </FormInput>
            )}
            <FormInput label="Message" required>
              <textarea
                id="notification-message"
                className="textarea textarea-bordered w-full"
                rows={6}
                placeholder="Message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                required
              />
            </FormInput>
            <div className="flex gap-2">
              <button
                className="btn btn-flat"
                type="submit"
                disabled={!canPreview || preview.isPending}
              >
                {preview.isPending ? 'Preparing...' : 'Preview'}
              </button>
              <button
                className="btn btn-neutral"
                type="button"
                disabled={!canPreview || send.isPending}
                onClick={() => void handleSend()}
              >
                {send.isPending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </form>

        <div className="space-y-4 w-full">
          <h2 className="font-semibold mt-0">Preview</h2>
          {preview.data ? (
            <div className="bg-white space-y-4">
              <p className="mt-0 text-xs font-bold uppercase">
                {preview.data.data.recipients} recipient(s) ·{' '}
                {preview.data.data.channels.join(' + ')}
              </p>
              {channels.includes('in_app') && (
                <div className="rounded-box border border-border p-4">
                  <p className="font-semibold my-0!">
                    {preview.data.data.in_app.title}
                    <span className="text-xs text-muted ms-2">
                      In-App Title
                    </span>
                  </p>
                  <p className="my-0! text-sm">
                    {preview.data.data.in_app.message}
                  </p>
                </div>
              )}
              {channels.includes('email') && (
                <div className="rounded-box border border-border p-4">
                  <p className="font-semibold my-0!">
                    {preview.data.data.email.subject}{' '}
                    <span className="text-xs text-muted ms-2">
                      Subject Line
                    </span>
                  </p>
                  <p className="my-0! text-sm">
                    {preview.data.data.email.message}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-box border border-dashed border-border p-4">
              Complete the form and choose Preview.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
