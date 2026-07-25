import { CalendarClock } from 'lucide-react'

type PageUpdatedAtProps = {
  updatedAt?: string
  locale?: string
}

export function PageUpdatedAt(props: PageUpdatedAtProps) {
  const { updatedAt, locale } = props
  if (!updatedAt) return null

  const date = new Date(updatedAt)
  if (Number.isNaN(date.getTime())) return null

  const label = locale?.toLowerCase().startsWith('zh') ? '最后更新' : 'Last updated'
  const formattedDate = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date)

  return (
    <p className="clarify-page-updated-at m-0 flex items-center gap-1.5 text-xs text-(--clarify-ui-text-faint)">
      <CalendarClock className="size-3.5" aria-hidden="true" />
      <span>{label}</span>
      <time dateTime={updatedAt}>{formattedDate}</time>
    </p>
  )
}
