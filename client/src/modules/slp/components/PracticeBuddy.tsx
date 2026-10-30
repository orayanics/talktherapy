/** Tala: an original star companion for TalkTherapy, drawn as scalable SVG. */
export default function PracticeBuddy({
  size = 80,
  celebrate = false,
}: {
  size?: number
  celebrate?: boolean
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
      className={`slp-tala ${celebrate ? 'slp-tala-celebrate' : ''}`}
    >
      {celebrate && (
        <g
          stroke="var(--practice-accent)"
          strokeWidth="4"
          strokeLinecap="round"
        >
          <path d="M12 22l-5-5M106 21l6-5M9 61H3M111 61h6" />
        </g>
      )}
      <path
        d="M40 98l-7 8c-3 4 6 7 14 2l4-7M73 99l3 9c7 5 16 2 14-2l-9-9"
        fill="var(--practice-accent)"
      />
      <path
        d="M55 17c2-5 8-5 10 0l12 25 27 4c6 1 8 7 4 11L88 77l5 28c1 5-4 9-9 6L60 98l-24 13c-5 3-10-1-9-6l5-28L12 57c-4-4-2-10 4-11l28-4 11-25Z"
        fill="#facc4b"
        stroke="#b97713"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M41 55c0-6 10-6 10 0v9c0 6-10 6-10 0v-9ZM69 55c0-6 10-6 10 0v9c0 6-10 6-10 0v-9Z"
        fill="#fff"
      />
      <path
        d="M46 58v5M74 58v5"
        stroke="#334155"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d={celebrate ? 'M48 77q12 18 24 0H48Z' : 'M49 77q11 10 22 0'}
        fill={celebrate ? '#78350f' : 'none'}
        stroke="#78350f"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="36" cy="74" r="5" fill="#f59b66" />
      <circle cx="84" cy="74" r="5" fill="#f59b66" />
    </svg>
  )
}
