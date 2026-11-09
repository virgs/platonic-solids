import { expect, test } from '@playwright/test'

test('the canvas occupies one responsive 16:9 stage without a spacer gap', async ({
  page,
}) => {
  await page.goto('./?solid=tetrahedron')

  const stage = page.getByLabel('Interactive 3D model of a Tetrahedron')
  await expect(stage).toBeVisible()

  const box = await stage.boundingBox()
  expect(box).not.toBeNull()
  expect(box!.width / box!.height).toBeCloseTo(16 / 9, 1)

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

test('mobile controls remain outside the stage', async ({ page }) => {
  await page.goto('./')

  const stageBox = await page
    .getByLabel('Interactive 3D model of a Tetrahedron')
    .boundingBox()
  const dualButtonBox = await page
    .getByRole('button', { name: /Show dual/ })
    .boundingBox()

  expect(stageBox).not.toBeNull()
  expect(dualButtonBox).not.toBeNull()
  expect(dualButtonBox!.y).toBeGreaterThanOrEqual(stageBox!.y + stageBox!.height)
})
