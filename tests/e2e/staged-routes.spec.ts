import { expect, test } from '@playwright/test'
import { setTransformationTime } from './controls'

test('both formerly planned destinations play, expose checkpoints, and reverse', async ({ page }) => {
  for (const [name,stages] of [['Great dodecahedron',2],['Great stellated dodecahedron',3]] as const) {
    await page.goto('./?solid=dodecahedron')
    await setTransformationTime(page,0.5)
    await page.getByRole('button', { name: 'Choose stellation destination' }).click()
    await page.getByRole('button', { name: `${name} · ${stages}-stage route`, exact: true }).click()
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Seek to Small stellated dodecahedron checkpoint' })).toBeVisible()
    await page.getByRole('button', { name: 'Explain this transformation' }).click()
    await expect(page.getByRole('dialog', { name: 'How this transformation works' })).toContainText('staged route')
    await page.getByRole('button', { name: 'Close', exact: true }).click()
    await page.getByRole('button', { name: 'Play transformation', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Dodecahedron', exact: true })).toBeVisible()
  }
})

test('time popup is vertical and next to playback, and explanations belong to actions', async ({ page }) => {
  await page.goto('./')
  const player = page.getByRole('group', { name: 'Transformation player' })
  await expect(player.getByRole('button', { name: 'Explain this transformation' })).toHaveCount(0)
  await expect(page.getByRole('group', { name: 'Solid transformations' }).getByRole('button', { name: 'Explain this transformation' })).toBeVisible()
  await expect(page.getByRole('slider', { name: 'Transformation time', exact: true })).not.toBeVisible()
  await player.getByRole('button', { name: 'Adjust transformation time' }).click()
  const slider = page.getByRole('slider', { name: 'Transformation time', exact: true })
  await expect(slider).toHaveAttribute('aria-orientation','vertical')
  const box = await slider.boundingBox()
  expect(box!.height).toBeGreaterThan(box!.width)
  await slider.focus(); await slider.press('End')
  await expect(slider).toHaveAttribute('aria-valuenow','6')
  await page.screenshot({ path: test.info().outputPath('timing-popup.png'), animations: 'disabled' })
  const point = { x: box!.x+box!.width/2, y: box!.y+box!.height*0.9 }
  if (test.info().project.name === 'mobile-chromium') await page.touchscreen.tap(point.x,point.y)
  else await page.mouse.click(point.x,point.y)
  await expect(slider).toHaveAttribute('aria-valuenow','0.5')
  await slider.focus(); await slider.press('ArrowUp')
  await expect(slider).toHaveAttribute('aria-valuenow','0.6')
})

test('map arrows and line patterns distinguish reversible relationships without color', async ({ page }) => {
  await page.goto('./?solid=dodecahedron')
  await setTransformationTime(page,0.5)
  await page.getByRole('button', { name: 'Map', exact: true }).click()
  const map = page.getByRole('dialog', { name: 'Transformation map' })
  const edges = map.locator('path[data-route-kind]')
  await expect(edges).toHaveCount(10)
  expect(await edges.evaluateAll((paths) => paths.every((path) => path.hasAttribute('marker-start') && path.hasAttribute('marker-end')))).toBe(true)
  await expect(map.locator('path[data-route-kind="dual"]')).toHaveCount(5)
  await expect(map.locator('path[data-route-kind="stellate"]')).toHaveCount(3)
  await expect(map.locator('path[data-route-kind="staged"]')).toHaveCount(2)
  await page.screenshot({ path: test.info().outputPath('map-arrows.png'), animations: 'disabled' })
  await map.getByRole('button', { name: 'Stellation → Great stellated dodecahedron · 3-stage route', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Great stellated dodecahedron', exact: true })).toBeVisible()
})
