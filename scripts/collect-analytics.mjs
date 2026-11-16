import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const endpoint = 'https://api.vercel.com/v1/query/web-analytics/visits/count'
const kstOffset = 9 * 60 * 60 * 1000
const dayMs = 24 * 60 * 60 * 1000
const lookbackDays = 7
const statsDirectory = fileURLToPath(new URL('../stats/', import.meta.url))

function kstDate(time) {
  return new Date(time + kstOffset).toISOString().slice(0, 10)
}

function isCount(value) {
  return Number.isSafeInteger(value) && value >= 0
}

function hasVisitCounts(data) {
  return isCount(data?.visitors) && isCount(data?.pageviews)
}

async function readDays(filename) {
  let contents
  try {
    contents = await readFile(filename, 'utf8')
  } catch (error) {
    if (error.code === 'ENOENT') return {}
    throw error
  }

  const { days } = JSON.parse(contents)
  if (!days || typeof days !== 'object' || Array.isArray(days) ||
    !Object.entries(days).every(([date, counts]) => /^\d{4}-\d{2}-\d{2}$/.test(date) && hasVisitCounts(counts))) {
    throw new Error('기존 daily-visitors.json의 날짜별 기록 형식이 올바르지 않습니다.')
  }
  return days
}

function renderReport({ updatedAt, lifetimePageviews, days }) {
  const number = new Intl.NumberFormat('ko-KR')
  const updatedAtKst = new Date(Date.parse(updatedAt) + kstOffset).toISOString().slice(0, 19).replace('T', ' ')
  const totals = Object.values(days).reduce((sum, { visitors, pageviews }) => ({
    visitors: sum.visitors + visitors,
    pageviews: sum.pageviews + pageviews,
  }), { visitors: 0, pageviews: 0 })

  return [
    '# 방문 통계',
    '',
    `- 마지막 갱신 시각 **${updatedAtKst} KST**`,
    `- 기록된 날짜의 일일 고유 방문자 합계 **${number.format(totals.visitors)}명**`,
    `- 기록된 날짜의 페이지 조회 수 합계 **${number.format(totals.pageviews)}회**`,
    `- Analytics 활성화 이후 운영 사이트의 전체 페이지 조회 수 **${number.format(lifetimePageviews)}회**`,
    '',
    '일일 고유 방문자 합계는 같은 사람이 여러 날 방문하면 날짜마다 포함합니다. 전체 조회 수는 Vercel API의 날짜 제한 없는 조회 결과이며, 오늘 집계도 포함할 수 있습니다.',
    '',
    '| 날짜 (KST) | 일일 고유 방문자 | 페이지 조회 수 |',
    '| --- | ---: | ---: |',
    ...Object.entries(days).map(([date, { visitors, pageviews }]) =>
      `| ${date} | ${number.format(visitors)} | ${number.format(pageviews)} |`),
    '',
  ].join('\n')
}

export async function collectAnalytics({
  env = process.env,
  request = fetch,
  now = () => new Date(),
  directory = statsDirectory,
} = {}) {
  const token = env.VERCEL_TOKEN?.trim()
  const projectId = env.VERCEL_PROJECT_ID?.trim()
  const teamId = env.VERCEL_TEAM_ID?.trim()
  if (!token || !projectId) {
    throw new Error('VERCEL_TOKEN과 VERCEL_PROJECT_ID를 등록해 주세요.')
  }

  async function fetchCounts(label, range) {
    const url = new URL(endpoint)
    url.searchParams.set('projectId', projectId)
    if (teamId) url.searchParams.set('teamId', teamId)
    if (range) {
      url.searchParams.set('since', range.since)
      url.searchParams.set('until', range.until)
    }

    let response
    try {
      response = await request(url, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        signal: AbortSignal.timeout(15_000),
        redirect: 'error',
      })
    } catch {
      throw new Error(`${label} Vercel API 연결에 실패했거나 응답 시간이 초과되었습니다.`)
    }
    if (!response.ok) throw new Error(`${label} Vercel API 요청 실패 (HTTP ${response.status})`)

    const body = await response.json().catch(() => null)
    if (!hasVisitCounts(body?.data)) {
      throw new Error(`${label} Vercel API 응답에 유효한 visitors와 pageviews가 없습니다.`)
    }
    const { visitors, pageviews } = body.data
    return { visitors, pageviews }
  }

  const today = kstDate(now().getTime())
  const midnight = Date.parse(`${today}T00:00:00+09:00`)
  const filename = join(directory, 'daily-visitors.json')
  const days = await readDays(filename)
  for (let day = 1; day <= lookbackDays; day++) {
    const start = midnight - day * dayMs
    const date = kstDate(start)
    days[date] = await fetchCounts(date, {
      since: new Date(start).toISOString(),
      // Vercel treats until as inclusive. Exclude the next day's midnight.
      until: new Date(start + dayMs - 1).toISOString(),
    })
  }
  const { pageviews: lifetimePageviews } = await fetchCounts('전체 조회 수')
  const stats = {
    timezone: 'Asia/Seoul',
    updatedAt: now().toISOString(),
    lifetimePageviews,
    days: Object.fromEntries(Object.entries(days).sort(([a], [b]) => b.localeCompare(a))),
  }

  // Publish both files only after all eight requests have succeeded.
  await mkdir(directory, { recursive: true })
  await writeFile(filename, `${JSON.stringify(stats, null, 2)}\n`)
  await writeFile(join(directory, 'visitors.md'), renderReport(stats))
  console.log(`${today} KST 실행에서 최근 ${lookbackDays}일과 전체 조회 수를 갱신했습니다.`)
}

if (import.meta.main) {
  try {
    await collectAnalytics()
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
