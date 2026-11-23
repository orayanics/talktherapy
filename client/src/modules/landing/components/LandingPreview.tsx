import {
  BookOpen,
  CalendarDays,
  Check,
  FileText,
  Mic,
  Speech,
  Video,
} from 'lucide-react'

import PreviewCalendarDay from './PreviewCalendarDay'
import PreviewFeatureBadge from './PreviewFeatureBadge'
import PreviewMetric from './PreviewMetric'
import PreviewPlanStep from './PreviewPlanStep'

export const FEATURES = [
  {
    label: 'Appointments',
    icon: CalendarDays,
    headline: 'Make space for a conversation.',
    description:
      'Request an available appointment and see when your clinician confirms it.',
  },
  {
    label: 'Speech practice',
    icon: Mic,
    headline: 'Small steps. Your own pace.',
    description:
      'Explore speech exercises in English and Filipino. Record and replay your speech where supported.',
  },
  {
    label: 'Resources',
    icon: BookOpen,
    headline: 'A little guidance goes a long way.',
    description:
      'Explore learning resources and bookmark something helpful for later.',
  },
  {
    label: 'Care records',
    icon: FileText,
    headline: 'Keep your care in the picture.',
    description: 'Keep track of the notes and records that support your care.',
  },
]

export default function LandingPreview({
  feature,
  compact = false,
}: {
  feature: number
  compact?: boolean
}) {
  return (
    <div className={`tt-app-preview ${compact ? 'tt-app-compact' : ''}`}>
      <div className="tt-app-bar">
        <span>
          <Speech size={20} aria-hidden="true" />
          talktherapy.
        </span>
        <span className="tt-demo-label">Illustrative preview</span>
      </div>
      <div className="tt-app-body">
        {!compact && (
          <div className="tt-app-sidebar" aria-hidden="true">
            {FEATURES.map(({ label, icon: Icon }, index) => (
              <PreviewFeatureBadge
                key={label}
                index={index}
                Icon={Icon}
                label={label}
                feature={feature}
              />
            ))}
          </div>
        )}
        <div className="tt-app-content">
          <div className="tt-app-title">
            <div>
              <p>YOUR TALKTHERAPY SPACE</p>
              <h3>{FEATURES[feature].label}</h3>
            </div>
            <span className="tt-avatar">Y</span>
          </div>
          {feature === 0 && (
            <>
              <div className="tt-session-card">
                <Video size={28} aria-hidden="true" />
                <div>
                  <small>YOUR NEXT CONVERSATION</small>
                  <h4>Speech & language session</h4>
                  <p>Online appointment · 30 minutes</p>
                </div>
                <span className="tt-confirmed">
                  <Check size={13} aria-hidden="true" />
                  Confirmed
                </span>
              </div>
              <div className="tt-calendar-heading">
                <h4>A little time for you</h4>
                <span>Example week</span>
              </div>
              <div className="tt-week">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => (
                  <PreviewCalendarDay key={day} index={index} day={day} />
                ))}
              </div>
              <p className="tt-preview-message">
                <CalendarDays size={16} aria-hidden="true" />
                Your appointments, all in one place.
              </p>
            </>
          )}
          {feature === 1 && (
            <div className="tt-practice">
              <span className="tt-demo-label">FILIPINO · WORD PRACTICE</span>
              <img
                src="/slp/pictures/bola.jpg"
                alt="A ball, used as a speech practice prompt"
                width="150"
                height="140"
                loading="lazy"
                fetchPriority="low"
              />
              <h4>Let’s try a word together.</h4>
              <p>Listen. Say it. Take your time.</p>
              <span className="tt-record">
                <Mic size={16} aria-hidden="true" />
                Record and replay
              </span>
              <small>Practice support, not a diagnosis.</small>
            </div>
          )}
          {feature === 2 && (
            <div className="tt-resource-list">
              {[
                'Getting ready for your first session',
                'Making room for everyday practice',
                'Finding moments to communicate',
              ].map((title, index) => (
                <PreviewPlanStep key={title} index={index} title={title} />
              ))}
            </div>
          )}
          {feature === 3 && (
            <div className="tt-records">
              <p>A clearer picture of your care journey.</p>
              {['Session notes', 'Clinical observations', 'Care plan'].map(
                (label) => (
                  <PreviewMetric key={label} label={label} />
                ),
              )}
              <small>Sample layout · no patient information shown</small>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
