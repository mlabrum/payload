import React from 'react'

import H5Icon from '../../../../../icons/headings/H5/index.js'
import ElementButton from '../Button.js'

const H5 = ({ attributes, children }) => <h5 {...attributes}>{children}</h5>

const h5 = {
  Button: () => (
    <ElementButton format="h5">
      <H5Icon />
    </ElementButton>
  ),
  Element: H5,
}

export default h5
