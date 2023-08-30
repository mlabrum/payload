import React from 'react'
import { createRoot } from 'react-dom/client'

import Root from './Root.js'

const container = document.getElementById('app')
const root = createRoot(container) // createRoot(container!) if you use TypeScript
root.render(<Root />)

// Needed for Hot Module Replacement

if (
  typeof module !== 'undefined' &&
  module &&
  'hot' in module &&
  typeof module.hot === 'object' &&
  'accept' in module.hot &&
  typeof module.hot.accept === 'function'
) {
  module.hot.accept()
}
