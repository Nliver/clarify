import clsx from 'clsx'
import { Suspense } from 'react'
import type { ComponentType, CSSProperties, RefObject } from 'react'
import { Route, Routes } from 'react-router-dom'

import type { BuiltInTextKey } from '../core/i18n'
import { Header, Navigation } from '../shell'
import { RuntimeSlot } from '../slots'
import type { Config, NavigationNode, NavigationTab, RouteItem } from '../types'

import { BuiltInNotFoundPage } from './BuiltInNotFoundPage'
import { BuiltWithClarify } from './BuiltWithClarify'
import { PageErrorBoundary } from './ErrorBoundary'
import { PageActionsProvider, PageMetadata } from './PageActions'
import { PageBanner } from './PageBanner'
import { PageFooter } from './PageFooter'
import { PageNavigation } from './PageNavigation'
import { PageSkeleton } from './PageSkeleton'

export type AppShellLayoutConfig = {
  headerOffset: string
  sidebarScrollClassName: string
  contentClassName: string
}

type AppShellLayoutProps = {
  config: Config
  routes: RenderedRouteItem[]
  currentRoute?: RouteItem
  currentLocale: string | undefined
  currentNavigation: { items: NavigationNode[]; tabs?: NavigationTab[] }
  notFoundRouteComponent?: ComponentType
  layout: 'documentation' | 'blog'
  headerRef: RefObject<HTMLElement | null>
  headerTopAreaRef: RefObject<HTMLDivElement | null>
  layoutConfig: AppShellLayoutConfig
  pathname: string
  text: (key: BuiltInTextKey) => string
  activeBannerKey: string | undefined
  dismissedBannerKey: string | undefined
  bannerResolved: boolean
  onDismissBanner: () => void
}

type RenderedRouteItem = Omit<RouteItem, 'component'> & {
  component: ComponentType
}

type NotFoundRouteElementProps = {
  component?: ComponentType
}

function NotFoundRouteElement(props: NotFoundRouteElementProps) {
  const { component: RouteComponent } = props
  if (!RouteComponent) return <BuiltInNotFoundPage />
  return <RouteComponent />
}

type BannerSlotProps = {
  activeBannerKey: string | undefined
  dismissedBannerKey: string | undefined
  bannerResolved: boolean
  onDismiss: () => void
  config: Config
  locale?: string
}

function BannerSlot(props: BannerSlotProps) {
  const { activeBannerKey, dismissedBannerKey, bannerResolved, onDismiss, config, locale } = props
  function DefaultBannerComponent() {
    const hasBanner = bannerResolved && Boolean(config.banner) && dismissedBannerKey !== activeBannerKey
    if (!hasBanner) return null
    return <PageBanner currentLocale={locale} onDismiss={onDismiss} />
  }

  return <RuntimeSlot name="page.banner.replace" default={DefaultBannerComponent} />
}

function DefaultFooterComponent() {
  return <PageFooter />
}

export function AppShellLayout(props: AppShellLayoutProps) {
  const {
    config,
    routes,
    currentRoute,
    currentLocale,
    currentNavigation,
    notFoundRouteComponent,
    layout,
    headerRef,
    headerTopAreaRef,
    layoutConfig,
    pathname,
    text,
    activeBannerKey,
    dismissedBannerKey,
    bannerResolved,
    onDismissBanner,
  } = props
  const layoutStyle = { '--clarify-header-offset': layoutConfig.headerOffset } as CSSProperties
  const routeElements = (
    <Routes>
      {routes.map((route) => (
        <Route key={route.path} path={route.path} element={<route.component />} />
      ))}
      <Route path="*" element={<NotFoundRouteElement component={notFoundRouteComponent} />} />
    </Routes>
  )

  return (
    <>
      <Header
        ref={headerRef}
        topAreaRef={headerTopAreaRef}
        navigation={currentNavigation.items}
        tabs={currentNavigation.tabs}
        routes={props.routes}
        currentLocale={currentLocale}
        currentRoute={currentRoute}
        banner={<BannerSlot activeBannerKey={activeBannerKey} dismissedBannerKey={dismissedBannerKey} bannerResolved={bannerResolved} onDismiss={onDismissBanner} config={config} locale={currentLocale} />}
      />
      <div
        className="clarify-layout mx-auto grid w-full max-w-(--clarify-theme-layout-max-width) grid-cols-1 lg:grid-cols-(--clarify-layout-sidebar-grid) xl:grid-cols-(--clarify-layout-sidebar-grid-wide)"
        style={layoutStyle}
      >
        <aside data-pagefind-ignore className="clarify-sidebar hidden lg:block lg:self-stretch lg:bg-(--clarify-theme-tokens-colors-background) lg:px-5 xl:px-6">
          <div className={clsx('clarify-sidebar-scroll lg:sticky lg:z-30 lg:overflow-y-auto lg:pb-8', layoutConfig.sidebarScrollClassName)}>
            <Navigation navigation={currentNavigation.items} currentLocale={currentLocale} />
          </div>
        </aside>
        <div className={clsx('clarify-content @container relative flex min-h-screen min-w-0 flex-col px-4 pb-12 sm:px-6 lg:px-8 xl:px-10', layoutConfig.contentClassName, layout === 'blog' && 'clarify-content-blog')}>
          <PageActionsProvider route={currentRoute} locale={currentLocale}>
            <main className="clarify-main min-w-0 flex-auto" data-pagefind-body>
              <PageErrorBoundary
                key={pathname}
                title={text('renderError.title')}
                description={text('renderError.description')}
                reloadLabel={text('renderError.reload')}
                detailsLabel={text('renderError.details')}
                pathLabel={text('renderError.path')}
                typeLabel={text('renderError.type')}
                messageLabel={text('renderError.message')}
                stackLabel={text('renderError.stack')}
                componentStackLabel={text('renderError.componentStack')}
                copyLabel={text('actions.copy')}
                copiedLabel={text('actions.copied')}
                path={pathname}
              >
                <Suspense fallback={<PageSkeleton />}>
                  {routeElements}
                </Suspense>
              </PageErrorBoundary>
            </main>
            <PageMetadata updatedAt={currentRoute?.updatedAt} locale={currentLocale} />
            <PageNavigation navigation={currentNavigation.items} currentRoute={currentRoute} />
            <div className="clarify-page-footer-region mt-8 grid gap-5 border-t border-(--clarify-theme-tokens-colors-border) pt-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <div className="clarify-page-footer-slot min-w-0">
                <RuntimeSlot name="page.footer.before" />
                <RuntimeSlot name="page.footer.replace" default={DefaultFooterComponent} />
              </div>
              <div className="clarify-page-attribution flex justify-end sm:self-end">
                <BuiltWithClarify version={config.version} />
              </div>
            </div>
          </PageActionsProvider>
        </div>
      </div>
    </>
  )
}
