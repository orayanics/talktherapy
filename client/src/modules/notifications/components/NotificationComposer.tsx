import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchUsers } from '#/modules/users/api/users'
import type { AdminUser } from '#/modules/users/types/user'
import { useAdminNotificationComposer } from '#/modules/notifications/api/admin'
import type { BroadcastDraft } from '#/modules/notifications/api/admin'

const roles = ['patient', 'clinician', 'admin', 'superadmin'] as const

export default function NotificationComposer() {
  const [mode, setMode] = useState<'users' | 'role'>('users')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedUsers, setSelectedUsers] = useState<Record<string, AdminUser>>({})
  const [selectedRole, setSelectedRole] = useState('')
  const [channels, setChannels] = useState<Array<'in_app' | 'email'>>(['in_app'])
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const users = useQuery(fetchUsers({ page }, { search: search || undefined, account_status: ['active'] }))
  const { preview, send } = useAdminNotificationComposer()
  const resetPreview = preview.reset
  const resetSend = send.reset
  const visibleUsers = (users.data?.data ?? []).filter((user) => user.email_verified_at)
  const selectedUserIds = useMemo(
    () => Object.keys(selectedUsers),
    [selectedUsers],
  )
  const draft: BroadcastDraft = useMemo(() => ({
    recipient_ids: mode === 'users' ? selectedUserIds : undefined,
    roles: mode === 'role' && selectedRole ? [selectedRole] : undefined,
    channels,
    title,
    subject,
    message,
  }), [channels, message, mode, selectedRole, selectedUserIds, subject, title])
  const canPreview = channels.length > 0 && message.trim().length > 0 && (mode === 'users' ? selectedUserIds.length > 0 : Boolean(selectedRole))

  useEffect(() => {
    resetPreview()
    resetSend()
  }, [draft, resetPreview, resetSend])
  const toggleUser = (user: AdminUser) => setSelectedUsers((current) => {
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

  return <div className="mx-auto max-w-5xl space-y-6">
    <div><h1 className="text-2xl font-bold">Send notification</h1><p className="text-sm text-slate-500">Choose either specific users or one role, then preview before sending.</p></div>
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <form onSubmit={(event) => { event.preventDefault(); if (canPreview) void preview.mutateAsync(draft) }} className="space-y-5 rounded-lg border border-slate-200 bg-white p-5">
        <fieldset>
          <legend className="mb-2 font-semibold">Recipients</legend>
          <div className="tabs tabs-boxed mb-3 w-fit"><button type="button" className={`tab ${mode === 'users' ? 'tab-active' : ''}`} onClick={() => changeMode('users')}>Users</button><button type="button" className={`tab ${mode === 'role' ? 'tab-active' : ''}`} onClick={() => changeMode('role')}>Role</button></div>
          {mode === 'role' ? <div className="grid gap-2 sm:grid-cols-2">{roles.map((role) => <label key={role} className="label cursor-pointer justify-start gap-2"><input type="radio" name="recipient-role" className="radio radio-sm" checked={selectedRole === role} onChange={() => setSelectedRole(role)} /><span className="capitalize">{role}s</span></label>)}</div> : <>
            <label htmlFor="notification-user-search" className="sr-only">Search active users</label><input id="notification-user-search" className="input input-bordered mb-2 w-full" type="search" placeholder="Search active users" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} />
            <div className="max-h-72 overflow-y-auto rounded border border-slate-200 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{users.isPending ? <p className="p-4 text-sm text-slate-500">Loading users...</p> : visibleUsers.length === 0 ? <p className="p-4 text-sm text-slate-500">No matching active users.</p> : <ul className="divide-y divide-slate-100">{visibleUsers.map((user) => <li key={user.id}><label className="flex cursor-pointer items-center gap-3 p-3 hover:bg-slate-50"><input type="checkbox" className="checkbox checkbox-sm" checked={Boolean(selectedUsers[user.id])} onChange={() => toggleUser(user)} /><span className="min-w-0"><span className="block truncate text-sm font-medium">{user.name}</span><span className="block truncate text-xs text-slate-500">{user.email}</span></span></label></li>)}</ul>}</div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500"><span>{selectedUserIds.length} selected{users.data?.meta.total ? ` · ${users.data.meta.total} total` : ''}</span><div className="join"><button type="button" className="btn btn-xs join-item" disabled={page <= 1 || users.isFetching} onClick={() => setPage((current) => current - 1)}>Previous</button><button type="button" className="btn btn-xs join-item" disabled={!users.data?.meta || page >= users.data.meta.last_page || users.isFetching} onClick={() => setPage((current) => current + 1)}>Next</button></div></div>
          </>}
        </fieldset>
        <fieldset><legend className="mb-2 font-semibold">Channels</legend><div className="flex gap-4">{(['in_app', 'email'] as const).map((channel) => <label key={channel} className="label cursor-pointer gap-2"><input type="checkbox" aria-label={`Send by ${channel === 'in_app' ? 'in-app' : 'email'}`} className="checkbox checkbox-sm" checked={channels.includes(channel)} onChange={() => setChannels(channels.includes(channel) ? channels.filter((item) => item !== channel) : [...channels, channel])} /><span>{channel === 'in_app' ? 'In-app' : 'Email'}</span></label>)}</div></fieldset>
        {channels.includes('in_app') && <><label htmlFor="notification-title" className="label">In-app title</label><input id="notification-title" className="input input-bordered w-full" placeholder="In-app title" value={title} onChange={(event) => setTitle(event.target.value)} required /></>}
        {channels.includes('email') && <><label htmlFor="notification-subject" className="label">Email subject</label><input id="notification-subject" className="input input-bordered w-full" placeholder="Email subject" value={subject} onChange={(event) => setSubject(event.target.value)} required /></>}
        <label htmlFor="notification-message" className="label">Message</label><textarea id="notification-message" className="textarea textarea-bordered w-full" rows={6} placeholder="Message" value={message} onChange={(event) => setMessage(event.target.value)} required />
        <div className="flex gap-2"><button className="btn btn-outline" type="submit" disabled={!canPreview || preview.isPending}>{preview.isPending ? 'Preparing...' : 'Preview'}</button><button className="btn btn-primary" type="button" disabled={!canPreview || send.isPending} onClick={() => void send.mutateAsync(draft)}>{send.isPending ? 'Sending...' : 'Send'}</button></div>
        {send.isSuccess && <p role="status" className="text-sm text-success">Sent to {send.data.data.recipients} recipient(s).</p>}
        {send.isError && <p role="alert" className="text-sm text-error">Unable to send notification.</p>}
      </form>
      <div className="space-y-4"><h2 className="font-semibold">Preview</h2>{preview.data ? <div className="rounded-lg border border-slate-200 bg-white p-5"><p className="mb-2 text-xs font-bold uppercase text-slate-400">{preview.data.data.recipients} recipient(s) · {preview.data.data.channels.join(' + ')}</p>{channels.includes('in_app') && <div className="rounded bg-blue-50 p-4"><p className="font-semibold">{preview.data.data.in_app.title}</p><p className="mt-1 text-sm">{preview.data.data.in_app.message}</p></div>}{channels.includes('email') && <div className="mt-3 rounded bg-slate-50 p-4"><p className="text-xs text-slate-500">Subject</p><p className="font-semibold">{preview.data.data.email.subject}</p><p className="mt-1 text-sm">{preview.data.data.email.message}</p></div>}</div> : <div className="rounded-lg border border-dashed border-slate-300 p-8 text-sm text-slate-500">Complete the form and choose Preview.</div>}</div>
    </div>
  </div>
}
