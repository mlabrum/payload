import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouteMatch } from 'react-router-dom'

import type { FieldPermissions } from '../../../../auth/types.js'
import type { Field, FieldAffectingData } from '../../../../fields/config/types.js'
import type { StepNavItem } from '../../elements/StepNav/types.js'
import type { CompareOption, LocaleOption, Props } from './types.js'

import { fieldAffectsData } from '../../../../fields/config/types.js'
import { getTranslation } from '../../../../utilities/getTranslation.js'
import usePayloadAPI from '../../../hooks/usePayloadAPI.js'
import { formatDate } from '../../../utilities/formatDate/index.js'
import Eyebrow from '../../elements/Eyebrow/index.js'
import { Gutter } from '../../elements/Gutter/index.js'
import { useStepNav } from '../../elements/StepNav/index.js'
import { useAuth } from '../../utilities/Auth/index.js'
import { useConfig } from '../../utilities/Config/index.js'
import { useDocumentInfo } from '../../utilities/DocumentInfo/index.js'
import { useLocale } from '../../utilities/Locale/index.js'
import Meta from '../../utilities/Meta/index.js'
import CompareVersion from './Compare/index.js'
import fieldComponents from './RenderFieldsToDiff/fields/index.js'
import RenderFieldsToDiff from './RenderFieldsToDiff/index.js'
import Restore from './Restore/index.js'
import SelectLocales from './SelectLocales/index.js'
import './index.scss'
import { mostRecentVersionOption } from './shared.js'

const baseClass = 'view-version'

const VersionView: React.FC<Props> = ({ collection, global }) => {
  const {
    admin: { dateFormat },
    localization,
    routes: { admin, api },
    serverURL,
  } = useConfig()
  const { setStepNav } = useStepNav()
  const {
    params: { id, versionID },
  } = useRouteMatch<{ id?: string; versionID: string }>()
  const [compareValue, setCompareValue] = useState<CompareOption>(mostRecentVersionOption)
  const [localeOptions] = useState<LocaleOption[]>(() => (localization ? localization.locales : []))
  const [locales, setLocales] = useState<LocaleOption[]>(localeOptions)
  const { permissions } = useAuth()
  const { code: locale } = useLocale()
  const { i18n, t } = useTranslation('version')
  const { docPermissions } = useDocumentInfo()

  let originalDocFetchURL: string
  let versionFetchURL: string
  let entityLabel: string
  let fields: Field[]
  let fieldPermissions: Record<string, FieldPermissions>
  let compareBaseURL: string
  let slug: string
  let parentID: string

  if (collection) {
    ;({ slug } = collection)
    originalDocFetchURL = `${serverURL}${api}/${slug}/${id}`
    versionFetchURL = `${serverURL}${api}/${slug}/versions/${versionID}`
    compareBaseURL = `${serverURL}${api}/${slug}/versions`
    entityLabel = getTranslation(collection.labels.singular, i18n)
    parentID = id
    fields = collection.fields
    fieldPermissions = permissions.collections[collection.slug].fields
  }

  if (global) {
    ;({ slug } = global)
    originalDocFetchURL = `${serverURL}${api}/globals/${slug}`
    versionFetchURL = `${serverURL}${api}/globals/${slug}/versions/${versionID}`
    compareBaseURL = `${serverURL}${api}/globals/${slug}/versions`
    entityLabel = getTranslation(global.label, i18n)
    fields = global.fields
    fieldPermissions = permissions.globals[global.slug].fields
  }

  const compareFetchURL =
    compareValue?.value === 'mostRecent' || compareValue?.value === 'published'
      ? originalDocFetchURL
      : `${compareBaseURL}/${compareValue.value}`

  const [{ data: doc, isLoading: isLoadingData }] = usePayloadAPI(versionFetchURL, {
    initialParams: { depth: 1, locale: '*' },
  })
  const [{ data: publishedDoc }] = usePayloadAPI(originalDocFetchURL, {
    initialParams: { depth: 1, locale: '*' },
  })
  const [{ data: mostRecentDoc }] = usePayloadAPI(originalDocFetchURL, {
    initialParams: { depth: 1, draft: true, locale: '*' },
  })
  const [{ data: compareDoc }] = usePayloadAPI(compareFetchURL, {
    initialParams: { depth: 1, draft: 'true', locale: '*' },
  })

  useEffect(() => {
    let nav: StepNavItem[] = []

    if (collection) {
      let docLabel = ''

      if (mostRecentDoc) {
        const { useAsTitle } = collection.admin

        if (useAsTitle !== 'id') {
          const titleField = collection.fields.find(
            (field) => fieldAffectsData(field) && field.name === useAsTitle,
          ) as FieldAffectingData

          if (titleField && mostRecentDoc[useAsTitle]) {
            if (titleField.localized) {
              docLabel = mostRecentDoc[useAsTitle]?.[locale]
            } else {
              docLabel = mostRecentDoc[useAsTitle]
            }
          } else {
            docLabel = `[${t('general:untitled')}]`
          }
        } else {
          docLabel = mostRecentDoc.id
        }
      }

      nav = [
        {
          label: getTranslation(collection.labels.plural, i18n),
          url: `${admin}/collections/${collection.slug}`,
        },
        {
          label: docLabel,
          url: `${admin}/collections/${collection.slug}/${id}`,
        },
        {
          label: 'Versions',
          url: `${admin}/collections/${collection.slug}/${id}/versions`,
        },
        {
          label: doc?.createdAt ? formatDate(doc.createdAt, dateFormat, i18n?.language) : '',
        },
      ]
    }

    if (global) {
      nav = [
        {
          label: global.label,
          url: `${admin}/globals/${global.slug}`,
        },
        {
          label: 'Versions',
          url: `${admin}/globals/${global.slug}/versions`,
        },
        {
          label: doc?.createdAt ? formatDate(doc.createdAt, dateFormat, i18n?.language) : '',
        },
      ]
    }

    setStepNav(nav)
  }, [setStepNav, collection, global, dateFormat, doc, mostRecentDoc, admin, id, locale, t, i18n])

  let metaTitle: string
  let metaDesc: string
  const formattedCreatedAt = doc?.createdAt
    ? formatDate(doc.createdAt, dateFormat, i18n?.language)
    : ''

  if (collection) {
    const useAsTitle = collection?.admin?.useAsTitle || 'id'
    metaTitle = `${t('version')} - ${formattedCreatedAt} - ${doc[useAsTitle]} - ${entityLabel}`
    metaDesc = t('viewingVersion', { documentTitle: doc[useAsTitle], entityLabel })
  }

  if (global) {
    metaTitle = `${t('version')} - ${formattedCreatedAt} - ${entityLabel}`
    metaDesc = t('viewingVersionGlobal', { entityLabel })
  }

  let comparison = compareDoc?.version

  if (compareValue?.value === 'mostRecent') {
    comparison = mostRecentDoc
  }

  if (compareValue?.value === 'published') {
    comparison = publishedDoc
  }

  const canUpdate = docPermissions?.update?.permission

  return (
    <React.Fragment>
      <div className={baseClass}>
        <Meta description={metaDesc} title={metaTitle} />
        <Eyebrow />
        <Gutter className={`${baseClass}__wrap`}>
          <div className={`${baseClass}__intro`}>
            {t('versionCreatedOn', { version: t(doc?.autosave ? 'autosavedVersion' : 'version') })}
          </div>
          <header className={`${baseClass}__header`}>
            <h2>{formattedCreatedAt}</h2>
            {canUpdate && (
              <Restore
                className={`${baseClass}__restore`}
                collection={collection}
                global={global}
                originalDocID={id}
                versionDate={formattedCreatedAt}
                versionID={versionID}
              />
            )}
          </header>
          <div className={`${baseClass}__controls`}>
            <CompareVersion
              baseURL={compareBaseURL}
              onChange={setCompareValue}
              parentID={parentID}
              publishedDoc={publishedDoc}
              value={compareValue}
              versionID={versionID}
            />
            {localization && (
              <SelectLocales onChange={setLocales} options={localeOptions} value={locales} />
            )}
          </div>

          {doc?.version && (
            <RenderFieldsToDiff
              comparison={comparison}
              fieldComponents={fieldComponents}
              fieldPermissions={fieldPermissions}
              fields={fields}
              locales={locales ? locales.map(({ code }) => code) : []}
              version={doc?.version}
            />
          )}
        </Gutter>
      </div>
    </React.Fragment>
  )
}

export default VersionView
