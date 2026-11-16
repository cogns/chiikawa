import assert from 'node:assert/strict'
import { mkdtempDisposable, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { collectAnalytics } from '../scripts/collect-analytics.mjs'

const env = {
  VERCEL_TOKEN: 'mock-token',
  VERCEL_PROJECT_ID: 'prj_mock',
  VERCEL_TEAM_ID: 'team_mock',
}
const now = () => new Date('2026-01-01T00:10:00Z')
const daily = { visitors: 3, pageviews: 5 }
const lifetime = { visitors: 90, pageviews: 150 }
const answer = (data) => Response.json({ version: 1, query: {}, data })

async function createReportsDirectory(t) {
  const directory = await mkdtempDisposable(join(tmpdir(), 'chiikawa-analytics-'))
  t.after(() => directory.remove())
  return directory.path
}

test('KST 기준 완료된 7일과 전체 조회 수를 공식 엔드포인트에서 읽어 보고서를 생성한다', async (t) => {
  const directory = await createReportsDirectory(t)
  const queries = []
  await collectAnalytics({ env, now, directory, request: async (url, options) => {
    assert.equal(url.origin + url.pathname, 'https://api.vercel.com/v1/query/web-analytics/visits/count')
    assert.equal(options.headers.Authorization, 'Bearer mock-token')
    assert.equal(url.searchParams.get('projectId'), 'prj_mock')
    assert.equal(url.searchParams.get('teamId'), 'team_mock')
    queries.push(Object.fromEntries(url.searchParams))
    return answer(url.searchParams.has('since') ? daily : lifetime)
  } })

  assert.equal(queries.length, 8)
  assert.deepEqual(queries.map(({ since, until }) => [since, until]), [
    ['2025-12-30T15:00:00.000Z', '2025-12-31T14:59:59.999Z'],
    ['2025-12-29T15:00:00.000Z', '2025-12-30T14:59:59.999Z'],
    ['2025-12-28T15:00:00.000Z', '2025-12-29T14:59:59.999Z'],
    ['2025-12-27T15:00:00.000Z', '2025-12-28T14:59:59.999Z'],
    ['2025-12-26T15:00:00.000Z', '2025-12-27T14:59:59.999Z'],
    ['2025-12-25T15:00:00.000Z', '2025-12-26T14:59:59.999Z'],
    ['2025-12-24T15:00:00.000Z', '2025-12-25T14:59:59.999Z'],
    [undefined, undefined],
  ])
  const stats = JSON.parse(await readFile(join(directory, 'daily-visitors.json'), 'utf8'))
  assert.equal(stats.lifetimePageviews, 150)
  assert.deepEqual(Object.keys(stats.days), ['2025-12-31', '2025-12-30', '2025-12-29', '2025-12-28', '2025-12-27', '2025-12-26', '2025-12-25'])
  assert.deepEqual(stats.days['2025-12-31'], daily)
  const report = await readFile(join(directory, 'visitors.md'), 'utf8')
  assert.match(report, /2026-01-01 09:10:00 KST/)
  assert.match(report, /일일 고유 방문자 합계 \*\*21명\*\*/)
  assert.match(report, /페이지 조회 수 합계 \*\*35회\*\*/)
  assert.match(report, /전체 페이지 조회 수 \*\*150회\*\*/)
  assert.match(report, /\| 2025-12-31 \| 3 \| 5 \|/)
})

test('날짜를 재수집하면 같은 행만 갱신하고 오래된 기록을 보존한다', async (t) => {
  const directory = await createReportsDirectory(t)
  const jsonFile = join(directory, 'daily-visitors.json')
  await writeFile(jsonFile, JSON.stringify({ days: { '2025-11-01': { visitors: 8, pageviews: 10 } } }))
  let revisited = daily
  const options = {
    directory,
    env: { ...env, VERCEL_TEAM_ID: '' },
    now: () => new Date('2025-12-31T15:00:00Z'),
    request: async (url) => {
      assert.equal(url.searchParams.has('teamId'), false)
      const since = url.searchParams.get('since')
      if (since === '2025-12-30T15:00:00.000Z') return answer(revisited)
      return answer(since ? daily : lifetime)
    },
  }
  await collectAnalytics(options)
  const first = await readFile(jsonFile, 'utf8')
  await collectAnalytics(options)
  assert.equal(await readFile(jsonFile, 'utf8'), first)

  revisited = { visitors: 4, pageviews: 7 }
  await collectAnalytics(options)
  const stats = JSON.parse(await readFile(jsonFile, 'utf8'))
  assert.equal(Object.keys(stats.days).length, 8)
  assert.deepEqual(stats.days['2025-12-31'], revisited)
  assert.deepEqual(stats.days['2025-11-01'], { visitors: 8, pageviews: 10 })
  assert.match(await readFile(join(directory, 'visitors.md'), 'utf8'), /일일 고유 방문자 합계 \*\*30명\*\*/)
})

test('HTTP 오류 또는 유효하지 않은 응답이 오면 두 보고서를 그대로 보존한다', async (t) => {
  const directory = await createReportsDirectory(t)
  await collectAnalytics({ directory, env, now, request: async () => answer(daily) })
  const jsonFile = join(directory, 'daily-visitors.json')
  const reportFile = join(directory, 'visitors.md')
  const original = await Promise.all([readFile(jsonFile, 'utf8'), readFile(reportFile, 'utf8')])

  for (const [failure, message] of [
    [new Response('mock-token', { status: 503 }), /HTTP 503/],
    [answer({ visitors: 0 }), /유효한 visitors와 pageviews/],
  ]) {
    await assert.rejects(collectAnalytics({ directory, env, now, request: async (url) =>
      url.searchParams.has('since') ? answer({ visitors: 0, pageviews: 0 }) : failure,
    }), (error) => message.test(error.message) && !error.message.includes(env.VERCEL_TOKEN))
    assert.deepEqual(await Promise.all([readFile(jsonFile, 'utf8'), readFile(reportFile, 'utf8')]), original)
  }
})
