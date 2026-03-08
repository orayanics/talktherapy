import React from 'react'
import cx from 'classnames'
import type { GridProps } from '~/models/components'

const colsMap = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  7: 'grid-cols-7',
  8: 'grid-cols-8',
  9: 'grid-cols-9',
  10: 'grid-cols-10',
  11: 'grid-cols-11',
  12: 'grid-cols-12',
}

const rowsMap = {
  1: 'grid-rows-1',
  2: 'grid-rows-2',
  3: 'grid-rows-3',
  4: 'grid-rows-4',
  5: 'grid-rows-5',
  6: 'grid-rows-6',
  7: 'grid-rows-7',
  8: 'grid-rows-8',
  9: 'grid-rows-9',
  10: 'grid-rows-10',
  11: 'grid-rows-11',
  12: 'grid-rows-12',
}

const gapMap = {
  0: 'gap-0',
  1: 'gap-1',
  2: 'gap-2',
  4: 'gap-4',
  6: 'gap-6',
  8: 'gap-8',
}

export default function Grid(props: GridProps) {
  const {
    children,
    cols = 1,
    rows = 1,
    gap = 0,
    autoFit = false,
    className = '',
  } = props

  return (
    <div
      className={cx(
        'grid',
        autoFit ? 'grid-cols-[repeat(auto-fit,minmax(0,1fr))]' : colsMap[cols],
        rowsMap[rows],
        gapMap[gap],
        className,
      )}
    >
      {children}
    </div>
  )
}
