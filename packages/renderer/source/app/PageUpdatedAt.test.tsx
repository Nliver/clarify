import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { PageUpdatedAt } from './PageUpdatedAt'

describe('PageUpdatedAt', () => {
  it('renders localized update metadata', () => {
    const html = renderToStaticMarkup(<PageUpdatedAt updatedAt="2025-02-03T04:05:06.000Z" locale="zh-CN" />)

    expect(html).toContain('最后更新')
    expect(html).toContain('dateTime="2025-02-03T04:05:06.000Z"')
  })

  it('omits invalid or missing timestamps', () => {
    expect(renderToStaticMarkup(<PageUpdatedAt />)).toBe('')
    expect(renderToStaticMarkup(<PageUpdatedAt updatedAt="invalid" />)).toBe('')
  })
})
