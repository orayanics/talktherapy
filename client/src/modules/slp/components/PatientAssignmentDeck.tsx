import { useRef, useState } from 'react'
import type { MouseEvent, PointerEvent } from 'react'
import type { SlpAssignment } from '../api/workflow'
import AssignedExercise from './AssignedExercise'

export default function PatientAssignmentDeck({
  assignments,
}: {
  assignments: SlpAssignment[]
}) {
  const [index, setIndex] = useState(0)
  const [offset, setOffset] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'dragging' | 'leaving'>('idle')
  const startX = useRef<number | null>(null)
  const suppressClick = useRef(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const assignment = assignments[index]
  const canGoPrevious = index > 0
  const canGoNext = index < assignments.length - 1

  const move = (direction: -1 | 1) => {
    if ((direction < 0 && !canGoPrevious) || (direction > 0 && !canGoNext)) {
      setOffset(0)
      setPhase('idle')
      return
    }
    setPhase('leaving')
    setOffset(direction * -420)
    window.setTimeout(() => {
      setIndex((current) => current + direction)
      setOffset(0)
      setPhase('idle')
    }, 260)
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (phase === 'leaving') return
    startX.current = event.clientX
    event.currentTarget.setPointerCapture(event.pointerId)
    setPhase('dragging')
  }
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (startX.current === null || phase !== 'dragging') return
    setOffset(event.clientX - startX.current)
  }
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (startX.current === null) return
    const distance = event.clientX - startX.current
    startX.current = null
    if (Math.abs(distance) > 90) {
      suppressClick.current = true
      move(distance < 0 ? 1 : -1)
      return
    }
    setOffset(0)
    setPhase('idle')
  }
  const onCardClick = (event: MouseEvent<HTMLDivElement>) => {
    if (suppressClick.current) {
      suppressClick.current = false
      return
    }
    if (
      Math.abs(offset) > 8 ||
      (event.target instanceof HTMLElement && event.target.closest('button'))
    )
      return
    const bounds = cardRef.current?.getBoundingClientRect()
    if (!bounds) return
    move(event.clientX < bounds.left + bounds.width / 2 ? -1 : 1)
  }

  return (
    <div className="slp-deck" aria-label="Assigned speech exercises">
      <p className="slp-deck-hint">
        Drag the card, click either side, or use the arrow buttons to move
        between exercises.
      </p>
      <div className="slp-deck-stage">
        <button
          type="button"
          className="slp-deck-arrow slp-deck-arrow-left"
          aria-label="Previous exercise"
          disabled={!canGoPrevious || phase === 'leaving'}
          onClick={() => move(-1)}
        >
          ‹
        </button>
        <div
          ref={cardRef}
          className="slp-deck-card tt-card"
          data-phase={phase}
          style={{
            transform: `translateX(${offset}px) rotate(${offset / 24}deg)`,
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onClick={onCardClick}
        >
          <div className="flex items-start gap-3">
            <span className="tt-node now" aria-hidden="true">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-600">
                Exercise {index + 1} of {assignments.length}
              </p>
              <h3 className="mt-1 break-words text-xl font-bold">
                {assignment.version?.prompt_text ?? 'Assigned exercise'}
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {assignment.version?.task_type ?? 'Speech activity'} ·{' '}
                {assignment.version?.language ?? 'English'}
              </p>
            </div>
          </div>
          {assignment.status === 'active' && (
            <AssignedExercise assignmentId={assignment.id} />
          )}
        </div>
        <button
          type="button"
          className="slp-deck-arrow slp-deck-arrow-right"
          aria-label="Next exercise"
          disabled={!canGoNext || phase === 'leaving'}
          onClick={() => move(1)}
        >
          ›
        </button>
      </div>
      <div className="slp-deck-progress" aria-label="Exercise progress">
        {assignments.map((item, itemIndex) => (
          <span key={item.id} data-current={itemIndex === index} />
        ))}
      </div>
    </div>
  )
}
