import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthGuard } from '#/modules/auth/hooks/useAuth'
import RowError from '#/components/Table/RowError'
import { fetchSlpExercises, mutateCreateSlpExercise, type SlpExerciseModule } from '../api/exercises'

const modules: SlpExerciseModule[] = ['fluency', 'timing', 'articulation', 'aphasia', 'voice', 'motor_speech']

export default function SlpExerciseCatalog() {
  const { is } = useAuthGuard()
  const canShare = is('admin') || is('superadmin')
  const { data, isPending, isError } = useQuery(fetchSlpExercises())
  const create = mutateCreateSlpExercise()
  const [module, setModule] = useState<SlpExerciseModule>('fluency')
  const [language, setLanguage] = useState('en')
  const [taskType, setTaskType] = useState('passage_reading')
  const [prompt, setPrompt] = useState('')
  const [scope, setScope] = useState<'private' | 'shared'>('private')

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    await create.mutateAsync({ module, language, task_type: taskType, prompt_text: prompt, scope })
    setPrompt('')
  }

  if (isPending) return <div>Loading exercises…</div>
  if (isError) return <div role="alert">Could not load exercises.</div>

  return <div className="space-y-6">
    <div>
      <h1 className="text-xl font-semibold">SLP exercise catalog</h1>
      <p className="text-sm text-slate-600">Draft content is versioned and remains clinician-reviewed before publication.</p>
    </div>
    <form onSubmit={submit} className="space-y-3 rounded-lg border border-slate-300 bg-white p-5">
      <h2 className="font-semibold">New draft</h2>
      <div className="grid gap-3 md:grid-cols-2">
        <label>Module<select className="select w-full" value={module} onChange={(event) => setModule(event.target.value as SlpExerciseModule)}>{modules.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Language<input className="input w-full" value={language} onChange={(event) => setLanguage(event.target.value)} maxLength={16} /></label>
        <label>Task type<input className="input w-full" value={taskType} onChange={(event) => setTaskType(event.target.value)} maxLength={50} /></label>
        {canShare && <label>Scope<select className="select w-full" value={scope} onChange={(event) => setScope(event.target.value as 'private' | 'shared')}><option value="private">Private</option><option value="shared">Shared catalog</option></select></label>}
      </div>
      <label>Prompt<textarea className="textarea w-full" required value={prompt} onChange={(event) => setPrompt(event.target.value)} maxLength={2000} /></label>
      {create.isError && <RowError message="Could not save this draft." />}
      <button className="btn btn-neutral" disabled={create.isPending}>Save draft</button>
    </form>
    <ul className="space-y-2">{data?.data.map((exercise) => <li key={exercise.id} className="rounded border border-slate-200 p-3"><div className="font-medium">{exercise.latest_version?.prompt_text}</div><div className="text-xs text-slate-500">{exercise.module} · {exercise.latest_version?.language} · revision {exercise.latest_version?.revision}</div></li>)}</ul>
  </div>
}
