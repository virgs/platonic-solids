import { expect, test } from '@playwright/test'

test('mobile HUD prioritizes the canvas and expands the remaining properties on demand', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Mobile-specific compact controls')
  await page.goto('./?solid=cube')
  const summary = page.getByTestId('solid-summary')
  for (const label of ['Faces','Edges','Vertices']) await expect(summary.locator(`[data-property="${label}"]`)).toBeVisible()
  for (const label of ['Dihedral','Face types','Face angles','Dual']) await expect(summary.locator(`[data-property="${label}"]`)).not.toBeVisible()
  const stage = page.getByLabel('Interactive 3D model of a Cube')
  const compact = (await stage.boundingBox())!.height
  expect(compact).toBeGreaterThan(page.viewportSize()!.height * 0.45)
  for (const name of ['Zoom out','Zoom in','Toggle automatic rotation','Reset view','Map','History','Choose a solid']) {
    const button = page.getByRole('button', { name, exact: true })
    await expect(button).toBeVisible()
    expect((await button.innerText()).trim(), name).toBe('')
    await expect(button).toHaveAttribute('title', /.+/)
  }
  for (const name of ['Dual','Stellate','Rectify']) {
    await expect(page.getByRole('button', { name, exact: true })).toHaveText(name)
  }
  await expect(page.getByRole('button', { name: 'Toggle solid opacity' })).toContainText('85%')
  await expect(page.getByRole('button', { name: 'Adjust transformation time' })).toContainText('s')
  await page.getByRole('button', { name: 'Show all properties' }).click()
  await expect(page.getByRole('button', { name: 'Show fewer properties' })).toHaveAttribute('aria-expanded','true')
  for (const label of ['Dihedral','Face types','Face angles','Dual']) await expect(summary.locator(`[data-property="${label}"]`)).toBeVisible()
  await page.getByRole('button', { name: 'Show fewer properties' }).click()
  expect((await stage.boundingBox())!.height).toBeCloseTo(compact,1)
  const scrolls = await page.evaluate(() => document.documentElement.scrollHeight > innerHeight || document.documentElement.scrollWidth > innerWidth)
  expect(scrolls).toBe(false)
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
  await page.screenshot({ path: test.info().outputPath('compact-mobile-hud.png') })
})

test('GitHub link uses an active filled theme color', async ({ page }) => {
  await page.goto('./')
  const github = page.getByRole('link', { name: 'GitHub', exact: true })
  await expect(github).toHaveClass(/btn-success/)
  await expect(github).toHaveAttribute('href','https://github.com/virgs/platonic-solids')
})
