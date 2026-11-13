import { expect, test } from '@playwright/test'
import { setTransformationTime, clickControl, chooseStellation } from './controls'

for (const [from,origin,name] of [
  ['dodecahedron','Dodecahedron','Small stellated dodecahedron'],
  ['dodecahedron','Dodecahedron','Great dodecahedron'],
  ['dodecahedron','Dodecahedron','Great stellated dodecahedron'],
  ['icosahedron','Icosahedron','Great icosahedron'],
  ['great-dodecahedron','Great dodecahedron','Great stellated dodecahedron'],
] as const) {
  test(`${origin} reshapes into ${name} on one surface and reverses`, async ({ page }) => {
    await page.goto(`./?solid=${from}`)
    await setTransformationTime(page,0.5)
    await chooseStellation(page, name)
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
    const player = page.getByRole('group', { name: 'Transformation player' })
    await expect(player.getByRole('button', { name: /checkpoint/ })).toHaveCount(0)
    const progress = player.getByRole('slider', { name: /Transformation progress/ })
    await progress.fill('0.5')
    await expect(page.getByRole('button', { name: 'Dual', exact: true })).toBeDisabled()
    await expect(page.locator('canvas')).toHaveAttribute('data-engine', /three.js/)
    await page.screenshot({ path: test.info().outputPath('connected-stellation-midpoint.png'), animations: 'disabled' })
    await page.getByRole('button', { name: 'Explain this transformation' }).click()
    await expect(page.getByRole('dialog', { name: 'How this transformation works' })).toContainText('The exterior stays connected throughout')
    if (name === 'Small stellated dodecahedron') await expect(page.getByRole('dialog')).toContainText('One pentagonal pyramid grows')
    if (from === 'great-dodecahedron') await expect(page.getByRole('dialog')).toContainText('Twenty triangular dimples share one icosahedral framework')
    await page.getByRole('button', { name: 'Close', exact: true }).click()
    await player.getByRole('button', { name: 'Go to transformation end' }).click()
    await page.getByRole('button', { name: 'Play transformation', exact: true }).click()
    await expect(page.getByRole('heading', { name: origin, exact: true })).toBeVisible()
  })
}

test('time and explanation controls belong to playback', async ({ page }) => {
  await page.goto('./')
  const player = page.getByRole('group', { name: 'Transformation player' })
  const explain = player.getByRole('button', { name: 'Explain this transformation' })
  await expect(explain).toBeVisible()
  const actions = page.getByRole('group', { name: 'Solid transformations' })
  await expect(actions.getByRole('button', { name: 'Explain this transformation' })).toHaveCount(0)
  await explain.click()
  await expect(page.getByRole('dialog', { name: 'How this transformation works' })).toBeVisible()
  await page.getByRole('button', { name: 'Close', exact: true }).click()
  await expect(page.getByRole('slider', { name: 'Transformation time', exact: true })).not.toBeVisible()
  await player.getByRole('button', { name: 'Adjust transformation time' }).click()
  const slider = page.getByRole('slider', { name: 'Transformation time', exact: true })
  await expect(slider).toHaveAttribute('aria-orientation','vertical')
  const box = await slider.boundingBox()
  expect(box!.height).toBeGreaterThan(box!.width)
  await slider.focus(); await slider.press('End')
  await expect(slider).toHaveAttribute('aria-valuenow','10')
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('platonic-solids.settings.v1')!).duration)).toBe(10)
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
  await clickControl(page, 'Map')
  const map = page.getByRole('dialog', { name: 'Transformation map' })
  const edges = map.locator('path[data-route-kind]')
  await expect(edges).toHaveCount(32)
  expect(await edges.evaluateAll((paths) => paths.every((path) => path.hasAttribute('marker-start') && path.hasAttribute('marker-end')))).toBe(true)
  await expect(map.locator('path[data-route-kind="dual"]')).toHaveCount(12)
  await expect(map.locator('path[data-route-kind="stellate"]')).toHaveCount(5)
  await expect(map.locator('path[data-route-kind="rectify"]')).toHaveCount(10)
  await expect(map.locator('path[data-route-kind="truncate"]')).toHaveCount(5)
  await expect(map.locator('path[data-route-kind="staged"]')).toHaveCount(0)
  await expect(map.getByText(/Dotted|multi-step|staged/)).toHaveCount(0)
  expect((await map.locator('svg text').allTextContents()).filter((text) => /^\d+$/.test(text))).toEqual([])
  await page.screenshot({ path: test.info().outputPath('map-arrows.png'), animations: 'disabled' })
  await map.getByRole('button', { name: 'Stellation → Great stellated dodecahedron', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Great stellated dodecahedron', exact: true })).toBeVisible()
})
