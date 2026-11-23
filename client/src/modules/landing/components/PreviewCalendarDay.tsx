
export default function PreviewCalendarDay({ index, day }: { index: number; day: string }) {
  return (
    <div className={index === 2 ? 'tt-selected-day' : ''}>
      <span>{day}</span>
      <strong>{12 + index}</strong>
      <i />
    </div>
  )
}
