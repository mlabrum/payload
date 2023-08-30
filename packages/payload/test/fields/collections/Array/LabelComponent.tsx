import React from 'react'

import type { RowLabelComponent } from '../../../../src/admin/components/forms/RowLabel/types.js'

export const ArrayRowLabel: RowLabelComponent = ({ data }) => {
  return (
    <div style={{ color: 'coral', textTransform: 'uppercase' }}>{data.title || 'Untitled'}</div>
  )
}
