import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, AudioLines, Hand } from 'lucide-react'
import type { PointerEvent } from 'react'
import type { SlpAssignment } from '../api/workflow'
import AssignedExercise from './AssignedExercise'
import { useCalmMotion } from './PracticeRewards'

export default function PatientAssignmentDeck({ assignments }: { assignments: SlpAssignment[] }) {
  const [activeId, setActiveId] = useState(assignments.at(0)?.id)
  const index = Math.max(0, assignments.findIndex((item) => item.id === activeId))
  const assignment = assignments.at(index)
  const [offset, setOffset] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'dragging' | 'leaving'>('idle')
  const [locked, setLocked] = useState(false)
  const calm = useCalmMotion(false)
  const gesture = useRef<{ id: number; x: number; y: number; time: number } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const moving = useRef(false)
  const cardRef = useRef<HTMLDivElement>(null)
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  const move = (direction: -1 | 1) => {
    const next = assignments.at(index + direction)
    if (locked || moving.current || index + direction < 0 || !next) {
      setOffset(0)
      setPhase('idle')
      return
    }
    moving.current = true
    setPhase('leaving')
    setOffset(calm ? 0 : -direction * (cardRef.current?.offsetWidth ?? 400))
    timer.current = setTimeout(() => {
      setActiveId(next.id)
      setOffset(0)
      setPhase('idle')
      moving.current = false
    }, calm ? 0 : 240)
  }
  const cancel = () => {
    gesture.current = null
    setOffset(0)
    setPhase('idle')
  }
  const start = (event: PointerEvent<HTMLDivElement>) => {
    if (locked || moving.current || event.button !== 0 || gesture.current) return
    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, time: event.timeStamp }
    event.currentTarget.setPointerCapture(event.pointerId)
    setPhase('dragging')
  }
  const drag = (event: PointerEvent<HTMLDivElement>) => {
    const origin = gesture.current
    if (!origin || origin.id !== event.pointerId) return
    const distance = event.clientX - origin.x
    if (Math.abs(event.clientY - origin.y) > Math.abs(distance) + 12) { cancel(); return }
    const atEdge = (index === 0 && distance > 0) || (index === assignments.length - 1 && distance < 0)
    setOffset(distance * (atEdge ? 0.2 : 1))
  }
  const release = (event: PointerEvent<HTMLDivElement>) => {
    const origin = gesture.current
    if (!origin || origin.id !== event.pointerId) return
    gesture.current = null
    const distance = event.clientX - origin.x
    const speed = Math.abs(distance) / Math.max(1, event.timeStamp - origin.time)
    if (Math.abs(distance) > 80 || (Math.abs(distance) > 24 && speed > 0.5)) {
      move(distance < 0 ? 1 : -1)
    } else if (Math.abs(distance) < 6 && Math.abs(event.clientY - origin.y) < 6) {
      const bounds = event.currentTarget.getBoundingClientRect()
      move(event.clientX < bounds.left + bounds.width / 2 ? -1 : 1)
    } else { setOffset(0); setPhase('idle') }
  }

  if (!assignment) return null
  return (
    <section className="slp-deck" aria-label="Assigned speech exercises" aria-roledescription="carousel">
      <div className="slp-deck-toolbar">
        <span className="slp-deck-eyebrow">YOUR PRACTICE CARDS</span>
        <span className="slp-deck-count" aria-live="polite" aria-atomic="true">{index + 1} / {assignments.length}</span>
      </div>
      <div className="slp-deck-stage">
        <div className="slp-deck-stack" aria-hidden="true" />
        <div ref={cardRef} className="slp-deck-card" data-phase={phase} data-locked={locked}
          style={{ transform: `translateX(${offset}px) rotate(${calm ? 0 : offset / 45}deg)` }}
          onPointerDown={start} onPointerMove={drag} onPointerUp={release}
          onPointerCancel={cancel} onLostPointerCapture={() => { if (gesture.current) cancel() }}>
          <div className="slp-deck-card-top">
            <span className="slp-deck-type">{assignment.version?.task_type.replaceAll('_', ' ') ?? 'Speech activity'}</span>
            <AudioLines size={24} aria-hidden="true" />
          </div>
          <div className="slp-deck-prompt">
            <span className="slp-deck-eyebrow">LET’S PRACTICE</span>
            <h3>{assignment.version?.prompt_text ?? 'Assigned exercise'}</h3>
            <p>One exercise. Your own pace.</p>
          </div>
          <div className="slp-deck-card-bottom">
            <span>{assignment.version?.exercise?.collection?.title ?? 'Assigned by your clinician'}</span>
            <span className="slp-deck-language">{assignment.version?.language ?? 'en'}</span>
          </div>
        </div>
      </div>
      <div className="slp-deck-navigation">
        <button type="button" className="slp-deck-arrow" aria-label="Previous exercise" disabled={index === 0 || locked || phase === 'leaving'} onClick={() => move(-1)}><ArrowLeft size={20} aria-hidden="true" /><span>Previous</span></button>
        <p className="slp-deck-hint"><Hand size={16} aria-hidden="true" /> Swipe or tap a side</p>
        <button type="button" className="slp-deck-arrow" aria-label="Next exercise" disabled={index === assignments.length - 1 || locked || phase === 'leaving'} onClick={() => move(1)}><span>Next</span><ArrowRight size={20} aria-hidden="true" /></button>
      </div>
      {locked && <p className="slp-deck-hint" role="status">Finish recording or submitting before changing cards.</p>}
      <div className="slp-deck-recording">
        <h3 className="slp-deck-recording-title"><AudioLines size={20} aria-hidden="true" /> Your turn</h3>
        <p className="slp-deck-hint">Record, listen, and send when you’re ready.</p>
        {assignments.map((item) => (
          <div key={item.id} hidden={item.id !== assignment.id}>
            {item.status === 'active' && <AssignedExercise assignmentId={item.id} onNavigationLockChange={setLocked} />}
          </div>
        ))}
      </div>
    </section>
  )
}
