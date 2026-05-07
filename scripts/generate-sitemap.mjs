import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const BASE_URL = 'https://www.mandarindaily.app'

const STATIC_PAGES = [
  { path: '/',              priority: '1.0', changefreq: 'weekly' },
  { path: '/hsk/1',        priority: '0.9', changefreq: 'weekly' },
  { path: '/hsk/2',        priority: '0.9', changefreq: 'weekly' },
  { path: '/hsk/3',        priority: '0.9', changefreq: 'weekly' },
  { path: '/hsk/4',        priority: '0.9', changefreq: 'weekly' },
  { path: '/hsk/5',        priority: '0.9', changefreq: 'weekly' },
  { path: '/hsk/6',        priority: '0.9', changefreq: 'weekly' },
  { path: '/hsk/7',        priority: '0.8', changefreq: 'weekly' },
  { path: '/hsk/8',        priority: '0.8', changefreq: 'weekly' },
  { path: '/hsk/9',        priority: '0.8', changefreq: 'weekly' },
  { path: '/grammar/1',    priority: '0.8', changefreq: 'monthly' },
  { path: '/grammar/2',    priority: '0.8', changefreq: 'monthly' },
  { path: '/grammar/3',    priority: '0.8', changefreq: 'monthly' },
  { path: '/grammar/4',    priority: '0.7', changefreq: 'monthly' },
  { path: '/grammar/5',    priority: '0.7', changefreq: 'monthly' },
  { path: '/grammar/6',    priority: '0.7', changefreq: 'monthly' },
  { path: '/pronunciation', priority: '0.8', changefreq: 'monthly' },
  { path: '/guides',        priority: '0.7', changefreq: 'monthly' },
  { path: '/radicals',      priority: '0.7', changefreq: 'monthly' },
  { path: '/measure-words', priority: '0.7', changefreq: 'monthly' },
  { path: '/search',        priority: '0.6', changefreq: 'monthly' },
  { path: '/daily',         priority: '0.6', changefreq: 'daily'   },
  { path: '/dialogues',     priority: '0.6', changefreq: 'monthly' },
]

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function url({ path, priority = '0.5', changefreq = 'monthly' }) {
  return `  <url>
    <loc>${escapeXml(BASE_URL + path)}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

// Collect all word IDs and grammar point IDs
const wordUrls = []
for (let level = 1; level <= 9; level++) {
  const dataPath = join(ROOT, 'data', `hsk${level}.json`)
  const words = JSON.parse(readFileSync(dataPath, 'utf-8'))
  for (const word of words) {
    wordUrls.push(url({ path: `/word/${word.id}`, priority: '0.6', changefreq: 'monthly' }))
  }
}

const grammarPath = join(ROOT, 'data', 'grammar.json')
const grammarPoints = JSON.parse(readFileSync(grammarPath, 'utf-8'))
const grammarUrls = grammarPoints.map(g =>
  url({ path: `/grammar/point/${g.id}`, priority: '0.5', changefreq: 'monthly' })
)

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${STATIC_PAGES.map(url).join('\n')}
${wordUrls.join('\n')}
${grammarUrls.join('\n')}
</urlset>`

const outPath = join(ROOT, 'public', 'sitemap.xml')
writeFileSync(outPath, sitemap, 'utf-8')

const total = STATIC_PAGES.length + wordUrls.length + grammarUrls.length
console.log(`✓ sitemap.xml — ${total} URLs written to public/sitemap.xml`)
