import { expect, test } from '@playwright/test'
import packageInfo from '../../package.json' with { type: 'json' }
import { solids } from '../../src/data/solids'
import { setTransformationTime } from './controls'

test('color, display preferences, selected solid and zoom survive reload', async ({ page }) => {
  await page.goto('./?solid=cube')
  await setTransformationTime(page,4)
  await page.getByRole('button', { name: 'Display', exact: true }).click()
  await page.getByRole('slider', { name: /Face opacity/ }).fill('0.65')
  await page.getByLabel('Color', { exact: true }).evaluate((input) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, '#ff6633')
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
  })
  await page.getByRole('button', { name: 'Zoom out', exact: true }).click()
  const beforeSelection = await page.evaluate(() => Math.hypot(...JSON.parse(localStorage.getItem('platonic-solids.settings.v1')!).cameraPosition))
  await page.locator('#solid-selector').click()
  await page.getByRole('button', { name: 'Octahedron', exact: true }).click()
  await expect(page.locator('canvas')).toHaveAttribute('data-engine', /three.js/)
  await expect.poll(async () => page.evaluate(() => Math.hypot(...JSON.parse(localStorage.getItem('platonic-solids.settings.v1')!).cameraPosition))).toBeCloseTo(beforeSelection,3)
  await page.locator('#solid-selector').click()
  await page.getByRole('button', { name: 'Cube', exact: true }).click()
  await page.getByRole('button', { name: 'Toggle automatic rotation' }).click()
  await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem('platonic-solids.settings.v1')!).color)).toBe('#ff6633')
  const radius = await page.evaluate(() => Math.hypot(...JSON.parse(localStorage.getItem('platonic-solids.settings.v1')!).cameraPosition))
  expect(radius).toBeGreaterThan(4.5)
  await page.goto('./')
  await expect(page.getByRole('heading', { name: 'Cube', exact: true })).toBeVisible()
  await expect(page.getByLabel('Color', { exact: true })).toHaveValue('#ff6633')
  await expect(page.getByRole('slider', { name: /Face opacity/ })).toHaveValue('0.65')
  await expect(page.getByRole('button', { name: 'Adjust transformation time' })).toContainText('4.0 s')
  await expect(page.getByRole('button', { name: 'Toggle automatic rotation' })).toHaveAttribute('aria-pressed','true')
  await expect(page.locator('canvas')).toHaveAttribute('data-engine', /three.js/)
  await expect.poll(async () => page.evaluate(() => Math.hypot(...JSON.parse(localStorage.getItem('platonic-solids.settings.v1')!).cameraPosition))).toBeCloseTo(radius, 3)
  await page.goto('./?solid=icosahedron')
  await expect(page.getByRole('heading', { name: 'Icosahedron', exact: true })).toBeVisible()
})

test('D20 stellates into a great icosahedron and back', async ({ page }) => {
  await page.goto('./?solid=icosahedron')
  await setTransformationTime(page,0.5)
  await page.getByRole('button', { name: 'Stellate', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Great icosahedron', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Unstellate', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Icosahedron', exact: true })).toBeVisible()
})

test('release identity is visible and uses the shared favicon', async ({ page }) => {
  await page.goto('./')

  await expect(page.getByText(`v${packageInfo.version}`, { exact: true })).toBeVisible()
  await expect(page.locator('nav img[src$="favicon.svg"]')).toBeVisible()
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
    'href',
    '/platonic-solids/favicon.svg',
  )
})

test('the canvas fills the available stage without a spacer gap', async ({
  page,
}) => {
  await page.goto('./?solid=tetrahedron')

  const stage = page.getByLabel('Interactive 3D model of a Tetrahedron')
  await expect(stage).toBeVisible()

  const box = await stage.boundingBox()
  expect(box).not.toBeNull()
  expect(box!.width).toBeGreaterThan(200)
  expect(box!.height).toBeGreaterThan(100)

  await expect.poll(async () => {
    const currentStage = await stage.boundingBox()
    const canvasBox = await stage.locator('canvas').boundingBox()
    return currentStage && canvasBox ? Math.abs(canvasBox.height-currentStage.height) : Infinity
  }, { timeout: 5000 }).toBeLessThan(0.5)
})

test('completed endpoints unlock the correct actions for every solid', async ({ page }) => {
  test.setTimeout(60000)
  const stellatable = new Set(['dodecahedron','icosahedron','small-stellated-dodecahedron','great-dodecahedron','great-stellated-dodecahedron','great-icosahedron'])
  for (const solid of solids) {
    await page.goto(`./?solid=${solid.id}`)
    await setTransformationTime(page,0.5)
    await page.getByRole('button', { name: 'Dual', exact: true }).click()
    await expect(page.getByRole('slider', { name: /Transformation progress/ })).toHaveValue('1')
    const destination = solids.find((entry) => entry.id === solid.dualId)!
    await expect(page.getByRole('heading', { name: destination.name, exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Dual', exact: true })).toBeEnabled()
    const stellar = page.getByRole('button', { name: /^(Unstellate|Stellate)$/ })
    if (stellatable.has(destination.id)) await expect(stellar).toBeEnabled()
    else await expect(stellar).toBeDisabled()
  }
})

test('solid selection updates the model, properties, and URL', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Tetrahedron', exact: true }).click()
  await page.getByRole('button', { name: 'Cube', exact: true }).click()

  await expect(page.getByRole('heading', { name: 'Cube' })).toBeVisible()
  await expect(page).toHaveURL(/solid=cube/)
  await expect(page.getByLabel('Interactive 3D model of a Cube')).toBeVisible()
})

test('dual animates before committing the target solid', async ({ page }) => {
  await page.goto('./?solid=cube')

  const dual = page.getByRole('button', { name: 'Dual' })
  await dual.click()
  await expect(dual).toBeDisabled()
  await expect(page.getByRole('heading', { name: 'Cube' })).toBeVisible()

  await expect(page.getByRole('heading', { name: 'Octahedron' })).toBeVisible({
    timeout: 3_000,
  })
  await expect(page).toHaveURL(/solid=octahedron/)
  await expect(dual).toBeEnabled()
  await dual.click()
  await expect(dual).toBeDisabled()
  await expect(page.getByRole('heading', { name: 'Cube' })).toBeVisible({ timeout: 3_000 })
  await expect(dual).toBeEnabled()
})

test('rotation defaults off and zoom out uses the expected icon', async ({ page }) => {
  await page.goto('./')

  await expect(
    page.getByRole('button', { name: 'Toggle automatic rotation' }),
  ).toHaveAttribute('aria-pressed', 'false')
  await expect(
    page.getByRole('button', { name: 'Zoom out' }).locator('.lucide-zoom-out'),
  ).toBeVisible()
})

test('duration controls the dual animation and locks while running', async ({ page }) => {
  await page.goto('./?solid=cube')
  const slider = page.getByRole('button', { name: 'Adjust transformation time' })
  await setTransformationTime(page,0.5)
  await page.getByRole('button', { name: 'Dual' }).click()
  await expect(slider).toBeDisabled()
  await expect(page.getByRole('heading', { name: 'Octahedron' })).toBeVisible({ timeout: 2000 })
  await expect(slider).toBeEnabled()
})

test('the player can seek, hold an intermediate shape, and resume', async ({ page }) => {
  await page.goto('./?solid=cube')
  const progress = page.getByRole('slider', { name: /Transformation progress/ })
  await progress.fill('0.5')
  await expect(progress).toHaveValue('0.5')
  await expect(page.getByRole('heading', { name: 'Cube', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Play transformation', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Play transformation', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Pause transformation', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Octahedron', exact: true })).toBeVisible()
  await progress.fill('0.25')
  await expect(progress).toHaveValue('0.25')
  await progress.fill('0')
  await expect(page.getByRole('heading', { name: 'Cube', exact: true })).toBeVisible()
  await expect(page.locator('#solid-selector')).toBeEnabled()
})

test('face opacity defaults to 85 percent and is adjustable', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Display', exact: true }).click()
  const opacity = page.getByRole('slider', { name: /Face opacity/ })
  await expect(opacity).toHaveValue('0.85')
  await opacity.fill('1')
  await expect(page.getByText('Face opacity: 100%', { exact: true })).toBeVisible()
})

test('all four Kepler–Poinsot models are selectable', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('./')
  for (const name of ['Small stellated dodecahedron', 'Great dodecahedron', 'Great stellated dodecahedron', 'Great icosahedron']) {
    await page.locator('#solid-selector').click()
    await page.getByRole('button', { name, exact: true }).click()
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Dual', exact: true })).toBeEnabled()
  }
  expect(errors).toEqual([])
  await expect(page.locator('canvas')).toHaveAttribute('data-engine', /three.js/)
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
  await page.screenshot({ path: test.info().outputPath('star-viewer.png') })
})

test('camera controls follow zoom, auto-rotate, reset order', async ({ page }) => {
  await page.goto('./')
  const controls = page.getByRole('group', { name: 'Camera controls' })
  await expect(controls.getByRole('button')).toHaveCount(4)
  expect(await controls.getByRole('button').evaluateAll((buttons) => buttons.map((button) => button.getAttribute('aria-label')))).toEqual([
    'Zoom out', 'Zoom in', 'Toggle automatic rotation', 'Reset view',
  ])
})

test('star duals, stellation, and unstellation share the player', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('./?solid=dodecahedron')
  await setTransformationTime(page,0.5)
  for (const [action, destination] of [
    ['Stellate','Small stellated dodecahedron'],
    ['Dual','Great dodecahedron'],
    ['Stellate','Great stellated dodecahedron'],
    ['Dual','Great icosahedron'],
    ['Dual','Great stellated dodecahedron'],
    ['Unstellate','Great dodecahedron'],
  ]) {
    await page.getByRole('button', { name: action, exact: true }).click()
    await expect(page.getByRole('heading', { name: destination, exact: true })).toBeVisible({ timeout: 3000 })
    await expect(page.getByRole('button', { name: 'Dual', exact: true })).toBeEnabled()
  }
  expect(errors).toEqual([])
  await expect(page.locator('canvas')).toHaveAttribute('data-engine', /three.js/)
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
  await page.screenshot({ path: test.info().outputPath('star-transformations.png') })
})

test('transformation controls remain above the stage', async ({ page }) => {
  await page.goto('./')

  const stageBox = await page
    .getByLabel('Interactive 3D model of a Tetrahedron')
    .boundingBox()
  const dualButtonBox = await page.getByRole('button', { name: 'Dual' }).boundingBox()

  expect(stageBox).not.toBeNull()
  expect(dualButtonBox).not.toBeNull()
  expect(dualButtonBox!.y + dualButtonBox!.height).toBeLessThanOrEqual(stageBox!.y)
})

test('the complete desktop HUD fits within one viewport', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) < 768)
  await page.goto('./')

  const dimensions = await page.evaluate(() => ({
    viewport: window.innerHeight,
    document: document.documentElement.scrollHeight,
  }))

  expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport)
})

test('camera controls are horizontally centered on desktop', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) < 768)
  await page.goto('./')

  const controls = await page.getByRole('group', { name: 'Camera controls' }).boundingBox()
  const viewportWidth = page.viewportSize()!.width

  expect(controls).not.toBeNull()
  expect(controls!.x + controls!.width / 2).toBeCloseTo(viewportWidth / 2, -1)
})
