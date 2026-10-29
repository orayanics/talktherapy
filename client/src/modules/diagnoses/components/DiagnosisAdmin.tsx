import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '#/lib/api/client'
import { useDiagnosisActions } from '#/modules/diagnoses/api/diagnoses'
import type { DiagnosisItem } from '#/modules/diagnoses/api/diagnoses'
import StateError from '#/components/State/StateError'
import StateLoading from '#/components/State/StateLoading'

export default function DiagnosisAdmin() {
  const query = useQuery({ queryKey: ['admin-diagnoses'], queryFn: async () => (await api<{ data: DiagnosisItem[] }>('/api/v1/admin/diagnoses')).data })
  const { create, update, archive } = useDiagnosisActions()
  const [editing, setEditing] = useState<DiagnosisItem | null>(null)
  const [draft, setDraft] = useState({ id: '', label: '', value: '' })
  const save = async () => {
    if (!draft.label.trim() || !draft.value.trim()) return
    if (editing) await update.mutateAsync({ id: editing.id, label: draft.label.trim(), value: draft.value.trim() })
    else await create.mutateAsync({ id: draft.id.trim() || draft.value.trim().toLowerCase().replace(/\s+/g, '-'), label: draft.label.trim(), value: draft.value.trim() })
    setEditing(null); setDraft({ id: '', label: '', value: '' })
  }
  if (query.isPending) return <StateLoading />
  if (query.isError) return <StateError />
  const diagnoses = query.data
  return <div className="space-y-4">
    <div className="flex items-center justify-between"><h1 className="text-xl font-bold">Diagnoses</h1><button className="btn btn-neutral" onClick={() => { setEditing(null); setDraft({ id: '', label: '', value: '' }) }}>Add diagnosis</button></div>
    <form onSubmit={(event) => { event.preventDefault(); void save() }} className="grid gap-2 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-4">
      <label className="label" htmlFor="diagnosis-id">ID (optional)</label><input id="diagnosis-id" className="input input-bordered" placeholder="ID (optional)" value={draft.id} onChange={(event) => setDraft({ ...draft, id: event.target.value })} disabled={Boolean(editing)} />
      <label className="label" htmlFor="diagnosis-label">Label</label><input id="diagnosis-label" className="input input-bordered" placeholder="Label" required value={draft.label} onChange={(event) => setDraft({ ...draft, label: event.target.value })} />
      <label className="label" htmlFor="diagnosis-value">Value</label><input id="diagnosis-value" className="input input-bordered" placeholder="Value" required value={draft.value} onChange={(event) => setDraft({ ...draft, value: event.target.value })} />
      <div className="flex gap-2"><button className="btn btn-primary" disabled={create.isPending || update.isPending}>{editing ? 'Save' : 'Create'}</button>{editing && <button type="button" className="btn btn-ghost" onClick={() => { setEditing(null); setDraft({ id: '', label: '', value: '' }) }}>Cancel</button>}</div>
    </form>
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white"><table className="table"><thead><tr><th>Label</th><th>Value</th><th>Status</th><th /></tr></thead><tbody>{diagnoses.map((diagnosis) => <tr key={diagnosis.id}><td>{diagnosis.label}</td><td>{diagnosis.value}</td><td>{diagnosis.active === false ? 'Archived' : 'Active'}</td><td className="text-right"><button className="btn btn-sm btn-ghost" onClick={() => { setEditing(diagnosis); setDraft({ id: diagnosis.id, label: diagnosis.label, value: diagnosis.value }) }}>Edit</button>{diagnosis.active === false ? <button className="btn btn-sm btn-ghost text-success" disabled={update.isPending} onClick={() => update.mutate({ id: diagnosis.id, label: diagnosis.label, value: diagnosis.value, active: true })}>Unarchive</button> : <button className="btn btn-sm btn-ghost text-error" disabled={archive.isPending} onClick={() => archive.mutate(diagnosis.id)}>Archive</button>}</td></tr>)}</tbody></table></div>
  </div>
}
