import { spawnSync } from 'node:child_process'
import { stat } from 'node:fs/promises'
import { relative } from 'node:path'

function normalizeDate(value: string | undefined): string | undefined {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

export async function getFileUpdatedAt(filePath: string, contentRoot: string): Promise<string | undefined> {
  try {
    const result = spawnSync('git', ['log', '-1', '--format=%cI', '--', relative(contentRoot, filePath)], {
      cwd: contentRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    const committedAt = normalizeDate(result.status === 0 ? result.stdout.trim() : undefined)
    if (committedAt) return committedAt
  } catch {
    // Fall through to the file timestamp when Git is unavailable.
  }

  try {
    return (await stat(filePath)).mtime.toISOString()
  } catch {
    return undefined
  }
}

export function resolveUpdatedAt(frontmatter: Record<string, unknown>, detectedAt: string | undefined): string | undefined {
  return normalizeDate(typeof frontmatter.updatedAt === 'string' ? frontmatter.updatedAt : undefined) ?? detectedAt
}
