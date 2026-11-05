import { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin, type ResolvedConfig } from 'vite'
import react from '@vitejs/plugin-react'

const SITE_ORIGIN = 'https://chiikawa-gift.vercel.app'
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

export function socialPreview(): Plugin {
  let config: ResolvedConfig
  let buildImage: ReturnType<typeof readPreview> | undefined

  function readPreview() {
    const source = readFileSync(resolve(config.publicDir, 'og-preview.png'))
    if (source.length < 24 || !source.subarray(0, 8).equals(PNG_SIGNATURE)) {
      throw new Error('public/og-preview.png를 실제 PNG 형식으로 저장해 주세요.')
    }
    const hash = createHash('sha256').update(source).digest('hex').slice(0, 16)
    return {
      source,
      fileName: `${config.build.assetsDir}/og-preview-${hash}.png`,
      hash,
      width: source.readUInt32BE(16),
      height: source.readUInt32BE(20),
    }
  }

  return {
    name: 'social-preview',
    configResolved(resolved) {
      config = resolved
    },
    buildStart() {
      if (config.command === 'build') {
        buildImage = readPreview()
        this.addWatchFile(resolve(config.publicDir, 'og-preview.png'))
      }
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const image = buildImage ?? readPreview()
        const path = config.command === 'build'
          ? image.fileName
          : `og-preview.png?v=${image.hash}`
        return html
          .replaceAll('__OG_IMAGE_URL__', new URL(path, SITE_ORIGIN).href)
          .replaceAll('__OG_IMAGE_WIDTH__', String(image.width))
          .replaceAll('__OG_IMAGE_HEIGHT__', String(image.height))
      },
    },
    generateBundle() {
      if (buildImage) {
        this.emitFile({
          type: 'asset',
          fileName: buildImage.fileName,
          source: buildImage.source,
        })
      }
    },
  }
}

export default defineConfig({ plugins: [react(), socialPreview()] })
