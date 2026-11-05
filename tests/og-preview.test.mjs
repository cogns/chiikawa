import assert from 'node:assert/strict'
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import test from 'node:test'
import { build, createServer } from 'vite'
import { socialPreview } from '../vite.config.ts'

const imagePath = new URL('../public/og-preview.png', import.meta.url)
const alternateImagePath = new URL('../public/favicon.png', import.meta.url)
const template = (await readFile(new URL('../index.html', import.meta.url), 'utf8'))
  .replace(/<body>[\s\S]*<\/body>/, '<body></body>')

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'chiikawa-og-'))
  assert.equal(dirname(root), resolve(tmpdir()))
  t.after(() => rm(root, { recursive: true, force: true }))
  await mkdir(join(root, 'public'))
  await copyFile(imagePath, join(root, 'public/og-preview.png'))
  await writeFile(join(root, 'index.html'), template)
  return root
}

function metadata(html) {
  assert.doesNotMatch(html, /__OG_IMAGE_/)
  return new Map([...html.matchAll(/<meta\s+(?:property|name)="([^"]+)"\s+content="([^"]*)"/g)]
    .map((match) => [match[1], match[2]]))
}

async function buildPreview(root) {
  await build({ root, configFile: false, logLevel: 'silent', plugins: [socialPreview()] })
  const tags = metadata(await readFile(join(root, 'dist/index.html'), 'utf8'))
  const image = await readFile(join(root, 'public/og-preview.png'))
  const url = new URL(tags.get('og:image'))
  assert.equal(url.origin, 'https://chiikawa-gift.vercel.app')
  assert.match(url.pathname, /^\/assets\/og-preview-[a-f0-9]{16}\.png$/)
  assert.equal(url.search, '')
  assert.equal(tags.get('twitter:image'), url.href)
  assert.equal(Number(tags.get('og:image:width')), image.readUInt32BE(16))
  assert.equal(Number(tags.get('og:image:height')), image.readUInt32BE(20))
  assert.deepEqual(await readFile(join(root, 'dist', url.pathname.slice(1))), image)
  assert.deepEqual(await readFile(join(root, 'dist/og-preview.png')), image)
  return url.href
}

test('이미지를 교체하면 빌드된 HTML의 실제 파일명과 크기가 함께 갱신된다', async (t) => {
  const root = await fixture(t)
  const first = await buildPreview(root)
  assert.equal(await buildPreview(root), first, '같은 이미지는 같은 URL을 유지한다')
  await copyFile(alternateImagePath, join(root, 'public/og-preview.png'))
  assert.notEqual(await buildPreview(root), first, '새 이미지는 다른 실제 파일 URL을 사용한다')
})

test('개발 서버도 새로고침 시 교체한 이미지의 버전과 크기를 읽는다', async (t) => {
  const root = await fixture(t)
  const server = await createServer({
    root,
    configFile: false,
    logLevel: 'silent',
    plugins: [socialPreview()],
    server: { middlewareMode: true, hmr: false, watch: null },
  })
  try {
    const first = metadata(await server.transformIndexHtml('/', template))
    await copyFile(alternateImagePath, join(root, 'public/og-preview.png'))
    const second = metadata(await server.transformIndexHtml('/', template))
    const image = await readFile(join(root, 'public/og-preview.png'))
    assert.notEqual(second.get('og:image'), first.get('og:image'))
    assert.equal(second.get('og:image'), second.get('twitter:image'))
    assert.equal(Number(second.get('og:image:width')), image.readUInt32BE(16))
    assert.equal(Number(second.get('og:image:height')), image.readUInt32BE(20))
  } finally {
    await server.close()
  }
})

test('확장자만 PNG인 잘못된 파일은 빌드에서 안내한다', async (t) => {
  const root = await fixture(t)
  await writeFile(join(root, 'public/og-preview.png'), 'not a PNG image')
  await assert.rejects(() => buildPreview(root), /실제 PNG 형식/)
})
