import { expect, test } from '@playwright/test'
import { solids } from '../../src/data/solids'

test('all solids keep the same property area and every value fits its reserved lines', async ({ page }) => {
  await page.goto('./')
  let height: number | undefined
  for (const solid of solids) {
    await page.locator('#solid-selector').click()
    await page.locator('.dropdown-menu').getByRole('button', { name: solid.name, exact: true }).click()
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
  }
  await page.screenshot({ path: test.info().outputPath('stable-properties.png') })
})

test('map links do not intersect and use drawn icons', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Map', exact: true }).click()
  const map = page.getByRole('group', { name: 'Relationships between all 11 solids' })
  await expect(map.locator('svg.lucide')).toHaveCount(15)
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
    return intersections
  })
  expect(crossings).toEqual([])
  await expect(map).not.toContainText('✂')
  await page.screenshot({ path: test.info().outputPath('planar-map.png') })
})
