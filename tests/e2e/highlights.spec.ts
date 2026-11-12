import { expect, test } from '@playwright/test'
import { setTransformationTime } from './controls'

test('counts toggle model highlights without moving the HUD and clear for transformations', async ({ page }) => {
  await page.goto('./?solid=cube')
  const stage = page.getByLabel('Interactive 3D model of a Cube')
  const before = await stage.boundingBox()
  for (const mode of ['faces','edges','vertices']) {
    const toggle = page.getByRole('button', { name: `Highlight ${mode}`, exact: true })
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-pressed','true')
    await expect(stage).toHaveAttribute('data-highlight',mode)
    expect(await stage.boundingBox()).toEqual(before)
    await page.screenshot({ path: test.info().outputPath(`highlight-${mode}.png`) })
    await toggle.click()
    await expect(stage).toHaveAttribute('data-highlight','none')
  }
  await page.getByRole('button', { name: 'Highlight vertices' }).click()
  await page.reload()
  await expect(page.getByRole('button', { name: 'Highlight vertices' })).toHaveAttribute('aria-pressed','true')
  await expect(stage).toHaveAttribute('data-highlight','vertices')
  await setTransformationTime(page,0.5)
  await page.getByRole('button', { name: 'Dual', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Highlight vertices' })).toBeDisabled()
  await expect(page.getByRole('heading', { name: 'Octahedron', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Highlight vertices' })).toHaveAttribute('aria-pressed','false')
  await page.getByRole('button', { name: 'Highlight edges' }).click()
  await expect(page.getByLabel('Interactive 3D model of a Octahedron')).toHaveAttribute('data-highlight','edges')
})
