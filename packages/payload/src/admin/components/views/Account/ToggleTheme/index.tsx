import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import type { OnChange } from '../../../forms/field-types/RadioGroup/types.js'
import type { Theme } from '../../../utilities/Theme/index.js'

import RadioGroupInput from '../../../forms/field-types/RadioGroup/Input.js'
import { useTheme } from '../../../utilities/Theme/index.js'

export const ToggleTheme: React.FC = () => {
  const { autoMode, setTheme, theme } = useTheme()
  const { t } = useTranslation('general')

  const onChange = useCallback<OnChange<Theme>>(
    (newTheme) => {
      setTheme(newTheme)
    },
    [setTheme],
  )

  return (
    <RadioGroupInput
      options={[
        {
          label: t('automatic'),
          value: 'auto',
        },
        {
          label: t('light'),
          value: 'light',
        },
        {
          label: t('dark'),
          value: 'dark',
        },
      ]}
      label={t('adminTheme')}
      name="theme"
      onChange={onChange}
      value={autoMode ? 'auto' : theme}
    />
  )
}
