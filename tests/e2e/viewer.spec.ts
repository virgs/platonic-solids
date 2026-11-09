import { expect, test } from '@playwright/test'

test('the canvas occupies one responsive 21:9 stage without a spacer gap', async ({
  page,
}) => {
  await page.goto('./?solid=tetrahedron')

  const stage = page.getByLabel('Interactive 3D model of a Tetrahedron')
  await expect(stage).toBeVisible()

  const box = await stage.boundingBox()
  expect(box).not.toBeNull()
  expect(box!.width / box!.height).toBeCloseTo(21 / 9, 1)

  const canvasBox = await stage.locator('canvas').boundingBox()
  expect(canvasBox).not.toBeNull()
  expect(canvasBox!.height).toBeCloseTo(box!.height, 0)
})

test('solid selection updates the model, properties, and URL', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Tetrahedron', exact: true }).click()
  await page.getByRole('button', { name: 'Cube', exact: true }).click()

  await expect(page.getByRole('heading', { name: 'Cube' })).toBeVisible()
  await expect(page).toHaveURL(/solid=cube/)
  await expect(page.getByLabel('Interactive 3D model of a Cube')).toBeVisible()
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
