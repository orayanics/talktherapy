import type { ReactNode } from 'react'
import { CircleAlert, CircleCheck, CircleX, Info } from 'lucide-react'

export type GeneralVariant =
  'default' | 'info' | 'error' | 'success' | 'warning'

interface VariantConfig {
  class: string
  icon: ReactNode
}

const ICON_PROPS = { size: 36, className: 'mx-auto' } as const

const VARIANT_CONFIG: Record<GeneralVariant, VariantConfig> = {
  default: {
    class: 'bg-neutral-50 border-b border-border text-neutral-700',
    icon: <Info {...ICON_PROPS} className="mx-auto text-neutral-700" />,
  },
  info: {
    class: 'bg-sky-50 text-sky-700',
    icon: <Info {...ICON_PROPS} className="mx-auto text-sky-700" />,
  },
  error: {
    class: 'bg-rose-50 text-rose-700',
    icon: <CircleX {...ICON_PROPS} className="mx-auto text-rose-700" />,
  },
  success: {
    class: 'bg-green-50 text-green-700',
    icon: <CircleCheck {...ICON_PROPS} className="mx-auto text-green-700" />,
  },
  warning: {
    class: 'bg-amber-50 text-amber-700',
    icon: <CircleAlert {...ICON_PROPS} className="mx-auto text-amber-700" />,
  },
}

interface ModalHeaderProps {
  variant?: GeneralVariant
  title?: ReactNode
  titleId?: string
  descriptionId?: string
  description?: ReactNode
  showIcon?: boolean
}

export default function ModalHeader({
  variant = 'default',
  title = 'Header',
  description,
  showIcon = true,
  titleId,
  descriptionId,
}: ModalHeaderProps) {
  const { class: variantClass, icon } = VARIANT_CONFIG[variant]

  return (
    <div className={`${variantClass} p-6 text-center flex flex-col gap-4`}>
      {showIcon && icon}
      <div>
        <h2 id={titleId} className="text-xl font-bold text-base-content my-0!">
          {title}
        </h2>
        {description && (
          <p id={descriptionId} className="mt-1 leading-relaxed my-0!">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
