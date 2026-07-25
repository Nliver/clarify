import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { getFileUpdatedAt, resolveUpdatedAt } from './git-metadata.js'

describe('Git document metadata', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'clarify-git-metadata-'))
  })

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true })
  })

  it('uses the latest Git committer date for a tracked file', async () => {
    const filePath = join(tempDir, 'guide.mdx')
    writeFileSync(filePath, '# Guide')
    execFileSync('git', ['init', '-q'], { cwd: tempDir })
    execFileSync('git', ['add', 'guide.mdx'], { cwd: tempDir })
    execFileSync('git', ['-c', 'user.name=Clarify', '-c', 'user.email=clarify@example.com', 'commit', '-qm', 'Add guide'], {
      cwd: tempDir,
      env: { ...process.env, GIT_AUTHOR_DATE: '2025-02-03T04:05:06Z', GIT_COMMITTER_DATE: '2025-02-03T04:05:06Z' },
    })

    await expect(getFileUpdatedAt(filePath, tempDir)).resolves.toBe('2025-02-03T04:05:06.000Z')
  })

  it('falls back to the file timestamp for an untracked file', async () => {
    const filePath = join(tempDir, 'draft.mdx')
    writeFileSync(filePath, '# Draft')

    const updatedAt = await getFileUpdatedAt(filePath, tempDir)

    expect(updatedAt).toBeDefined()
    expect(Number.isNaN(new Date(updatedAt!).getTime())).toBe(false)
  })

  it('allows a valid frontmatter value to override the detected timestamp', () => {
    expect(resolveUpdatedAt({ updatedAt: '2024-01-02' }, '2025-01-01T00:00:00.000Z')).toBe('2024-01-02T00:00:00.000Z')
    expect(resolveUpdatedAt({ updatedAt: 'invalid' }, '2025-01-01T00:00:00.000Z')).toBe('2025-01-01T00:00:00.000Z')
  })
})
