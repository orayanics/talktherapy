import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useAuthGuard } from '#/modules/auth/hooks/useAuth'
import RowError from '#/components/Table/RowError'
import FormInput from '#/components/Form/FormInput'
import { mutateCreateSlpExercise } from '../api/exercises'
import type { SlpExerciseModule } from '../api/exercises'

import { slpExerciseModules } from '../types/exercises'

export default function CreateSlpExercisePage() {
  const { is } = useAuthGuard()
  const canShare = is('admin') || is('superadmin')
  const create = mutateCreateSlpExercise()
  const [module, setModule] = useState<SlpExerciseModule>('fluency')
  const [language, setLanguage] = useState('en')
  const [taskType, setTaskType] = useState('passage_reading')
  const [prompt, setPrompt] = useState('')
  const [scope, setScope] = useState<'private' | 'shared'>('private')

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      await create.mutateAsync({
        module,
        language,
        task_type: taskType,
        prompt_text: prompt,
        scope,
        configuration: { patient_visible: false },
      })
      setPrompt('')
    } catch {
      /* Mutation state displays the error and preserves the draft. */
    }
  }

  return (
    <div className="space-y-6">
      <Link to="/slp/exercises" className="btn">
        Back to exercises
      </Link>
      <form
        onSubmit={submit}
        className="space-y-4 rounded-box border border-border p-4"
      >
        <div>
          <p className="font-semibold my-0!">New draft</p>
          <p className="text-muted my-0!">
            Exercises created can be toggled and assigned to patient/s or saved
            as draft for further revisions
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <FormInput label="Module">
            <select
              className="select w-full"
              value={module}
              onChange={(event) =>
                setModule(event.target.value as SlpExerciseModule)
              }
            >
              {slpExerciseModules.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </FormInput>
          <FormInput label="Language">
            <input
              className="input w-full"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              maxLength={16}
            />
          </FormInput>
          <FormInput label="Task type">
            <input
              className="input w-full"
              value={taskType}
              onChange={(event) => setTaskType(event.target.value)}
              maxLength={50}
            />
          </FormInput>
          {canShare && (
            <FormInput label="Scope">
              <select
                className="select w-full"
                value={scope}
                onChange={(event) =>
                  setScope(event.target.value as 'private' | 'shared')
                }
              >
                <option value="private">Private</option>
                <option value="shared">Shared catalog</option>
              </select>
            </FormInput>
          )}
        </div>
        <FormInput label="Prompt" required>
          <textarea
            className="textarea w-full"
            required
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            maxLength={2000}
          />
        </FormInput>
        {create.isError && <RowError message="Could not save this draft." />}
        <button className="btn btn-neutral" disabled={create.isPending}>
          Save draft
        </button>
      </form>
    </div>
  )
}
