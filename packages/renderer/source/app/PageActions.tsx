import { ExternalLink, PencilLine } from 'lucide-react'
import { createContext, useContext, type ReactNode } from 'react'

import { ContentActions } from '../shell/ContentActions'
import type { RouteItem } from '../types'

import { PageUpdatedAt } from './PageUpdatedAt'

type PageActionsContextValue = {
  route?: RouteItem
  locale?: string
}

type PageActionsProviderProps = PageActionsContextValue & {
  children: ReactNode
}

type PageMetadataProps = {
  updatedAt?: string
  locale?: string
}

const PageActionsContext = createContext<PageActionsContextValue>({})

export function PageActionsProvider(props: PageActionsProviderProps) {
  const { children, route, locale } = props

  return (
    <PageActionsContext.Provider value={{ route, locale }}>
      {children}
    </PageActionsContext.Provider>
  )
}

export function PageActions() {
  const { route } = useContext(PageActionsContext)

  return <ContentActions route={route} />
}

export function PageMetadata(props: PageMetadataProps) {
  const { route, locale: contextLocale } = useContext(PageActionsContext)
  const { updatedAt = route?.updatedAt, locale = contextLocale } = props

  return (
    <div className="clarify-page-metadata flex w-full items-center justify-end gap-3">
      <PageUpdatedAt updatedAt={updatedAt} locale={locale} />
      {route?.sourceEditUrl ? (
        <a
          href={route.sourceEditUrl}
          target="_blank"
          rel="noreferrer"
          className="clarify-page-edit-link inline-flex items-center gap-1.5 text-xs text-(--clarify-ui-text-faint) no-underline transition hover:text-(--clarify-ui-text)"
        >
          <PencilLine className="size-3.5" aria-hidden="true" />
          <span>{locale?.toLowerCase().startsWith('zh') ? '编辑此页面' : 'Edit this page'}</span>
          <ExternalLink className="size-3" aria-hidden="true" />
        </a>
      ) : null}
    </div>
  )
}
