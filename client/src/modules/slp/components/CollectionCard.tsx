import type { ExerciseCollection } from '../api/collections'

export default function CollectionCard({
  setSelected,
  collection,
  patientView,
}: {
  setSelected: React.Dispatch<React.SetStateAction<ExerciseCollection | null>>
  collection: ExerciseCollection
  patientView: boolean
}) {
  return (
    <button
      className="overflow-hidden rounded-box border border-base-300 text-left"
      onClick={() => setSelected(collection)}
    >
      {collection.cover_url && (
        <img
          src={collection.cover_url}
          alt=""
          className="h-40 w-full object-cover"
          loading="lazy"
        />
      )}
      <div className="space-y-2 p-4">
        <h2 className="font-semibold">{collection.title}</h2>
        <p className="line-clamp-3">{collection.description}</p>
        <p>
          {patientView
            ? 'Open practice collection'
            : `${collection.exercises_count ?? 0} exercises`}
          {collection.is_hidden ? ' · Hidden' : ''}
        </p>
      </div>
    </button>
  )
}
