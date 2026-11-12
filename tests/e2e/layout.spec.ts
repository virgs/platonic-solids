import { expect, test } from '@playwright/test'
import { clickControl, chooseSolid } from './controls'
import { solids } from '../../src/data/solids'

for (const expanded of [false,true]) test(`all solids keep the same property area and every value fits its reserved lines (${expanded ? 'expanded' : 'default'})`, async ({ page, isMobile }) => {
  test.slow(Boolean(process.env.CI) && isMobile, 'The hosted software renderer builds all 23 mobile models in this test')
  test.skip(expanded && !isMobile, 'Desktop already shows the full summary')
  await page.goto('./')
  if (expanded) await page.getByRole('button', { name: 'Show all properties' }).click()
  let height: number | undefined
  for (const solid of solids) {
    await chooseSolid(page, solid.id)
    await expect(page.getByRole('heading', { name: solid.name, exact: true })).toBeVisible()
    const summary = page.getByTestId('solid-summary')
    const bounds = await summary.boundingBox()
    height ??= bounds!.height
    expect(bounds!.height, solid.name).toBeCloseTo(height, 1)
    const overflow = await summary.evaluate((element) => {
      return [...element.querySelectorAll('[data-testid="property-value"], h1')].flatMap((value) => {
        const box = value.getBoundingClientRect(), slot = value.parentElement!.getBoundingClientRect()
        return box.height > slot.height + 1 || value.scrollWidth > value.clientWidth + 1 ? [value.textContent] : []
      })
    })
    expect(overflow, solid.name).toEqual([])
    const outside = await summary.evaluate(element => {
      const region=element.getBoundingClientRect()
      return [...element.querySelectorAll('h1, .badge, [data-testid="property-value"]')].filter(value=>value.getClientRects().length).flatMap(value=>{ const box=value.getBoundingClientRect(); return box.left<region.left-1 || box.right>region.right+1 ? [value.textContent] : [] })
    })
    expect(outside, solid.name).toEqual([])
  }
  await page.screenshot({ path: test.info().outputPath('stable-properties.png') })
})

test('map links do not intersect and use drawn icons', async ({ page }) => {
  await page.goto('./')
  await clickControl(page, 'Map')
  const map = page.getByRole('group', { name: 'Relationships between all 23 solids' })
  await expect(map.locator('svg.lucide')).toHaveCount(32)
  for (const [family,count] of [['Platonic solid',5],['Archimedean solid',7],['Catalan solid',7],['Kepler–Poinsot polyhedron',4]] as const) await expect(map.locator(`[data-family-label="${family}"]`)).toHaveCount(count)
  const crossings = await map.evaluate((svg) => {
    const paths = [...svg.querySelectorAll<SVGPathElement>('path[data-route-kind]')]
    const points = paths.map(path => Array.from({ length: 101 }, (_, i) => path.getPointAtLength(path.getTotalLength() * i / 100)))
    const cross = (a: DOMPoint, b: DOMPoint, c: DOMPoint) => (b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x)
    const intersections: string[] = []
    for (let i=0; i<points.length; i++) for (let j=i+1; j<points.length; j++) {
      let hit = false
      for (let a=1; a<101 && !hit; a++) for (let b=1; b<101; b++) {
        const p=points[i][a-1], q=points[i][a], r=points[j][b-1], s=points[j][b]
        if (cross(p,q,r)*cross(p,q,s)<0 && cross(r,s,p)*cross(r,s,q)<0) { hit=true; break }
      }
      if (hit) intersections.push(`${paths[i].textContent} / ${paths[j].textContent}`)
    }
    const nodes=[...svg.querySelectorAll('g[role="button"] rect')].map(rect => (rect as SVGGraphicsElement).getBBox())
    points.forEach((line,i) => { if (line.some(p=>nodes.some(box=>p.x>box.x && p.x<box.x+box.width && p.y>box.y && p.y<box.y+box.height))) intersections.push(`Link passes through a node: ${paths[i].textContent}`) })
    return intersections
  })
  expect(crossings).toEqual([])
  await expect(map).not.toContainText('✂')
  await page.screenshot({ path: test.info().outputPath('planar-map.png') })
})
