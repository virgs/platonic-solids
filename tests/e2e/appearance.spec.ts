import { expect, test, type Page } from '@playwright/test'

async function comparePixels(page: Page, reference: Buffer, screenshot: Buffer) {
  return page.evaluate(async (images) => {
    const pixels = await Promise.all(images.map(async (base64) => {
      const image = new Image()
      image.src = `data:image/png;base64,${base64}`
      await image.decode()
      const canvas = document.createElement('canvas')
      canvas.width = image.width; canvas.height = image.height
      const context = canvas.getContext('2d')!
      context.drawImage(image,0,0)
      return context.getImageData(0,0,image.width,image.height).data
    }))
    let maximumIncrease = 0, brightChannels = 0
    for (let i=0;i<pixels[0].length;i+=4) for (let channel=0;channel<3;channel++) {
      maximumIncrease = Math.max(maximumIncrease,pixels[1][i+channel]-pixels[0][i+channel])
      if (pixels[1][i+channel] > 200) brightChannels++
    }
    return { maximumIncrease, brightChannels }
  },[reference.toString('base64'),screenshot.toString('base64')])
}

test('rear edges fade gradually below full opacity', async ({ page }) => {
  await page.goto('./?solid=cube')
  await page.getByLabel('Color', { exact: true }).evaluate((input) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(input,'#000000')
    input.dispatchEvent(new Event('input',{ bubbles: true }))
    input.dispatchEvent(new Event('change',{ bubbles: true }))
  })
  const button = page.getByRole('button', { name: 'Toggle solid opacity' })
  const slider = page.getByRole('slider', { name: 'Solid opacity', exact: true })
  const captures: Buffer[] = []
  for (const [steps,expected] of [[0,'1'],[1,'0.99'],[5,'0.95']] as const) {
    await button.click()
    await slider.focus(); await slider.press('End')
    for (let i=0;i<steps;i++) await slider.press('ArrowDown')
    await expect(slider).toHaveAttribute('aria-valuenow',expected)
    await button.click()
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
    const screenshot = await page.locator('canvas').screenshot({ path: test.info().outputPath(`opacity-${expected}.png`) })
    await test.info().attach(`opacity-${expected}`,{ body: screenshot, contentType: 'image/png' })
    captures.push(screenshot)
  }
  // Bright newly visible rear edges caused the regression. A 1% change must
  // produce a small pixel change, even at edges hidden by the opaque surface.
  for (const [index,limit] of [[1,20],[2,35]]) {
    const { maximumIncrease, brightChannels } = await comparePixels(page,captures[0],captures[index])
    expect(brightChannels).toBeGreaterThan(50)
    expect(maximumIncrease).toBeLessThan(limit)
  }
})

test('buttons and menu actions have short tooltips and the color picker matches primary controls', async ({ page }) => {
  await page.goto('./?solid=dodecahedron')
  const missingTooltips = () => page.locator('button, [role="button"], a.btn').evaluateAll((buttons) => buttons
    .filter((button) => button.getClientRects().length && !button.getAttribute('title')?.trim() && !button.querySelector('title')?.textContent?.trim())
    .map((button) => button.getAttribute('aria-label') || button.textContent))
  expect(await missingTooltips()).toEqual([])
  const background = await page.getByRole('button', { name: 'Zoom out' }).evaluate((element) => getComputedStyle(element).backgroundColor)
  await expect.poll(() => page.getByTestId('solid-color-button').evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(background)
  for (const name of ['Dodecahedron','Choose stellation destination','Map','History','Explain this transformation']) {
    const toggle = name === 'Dodecahedron' ? page.locator('#solid-selector') : page.getByRole('button', { name, exact: true })
    if (name === 'Map' || name === 'History') await clickControl(page,name)
    else await toggle.click()
    expect(await missingTooltips()).toEqual([])
    if (['Map','History','Explain this transformation'].includes(name)) await page.getByRole('button', { name: 'Close', exact: true }).click()
    else await toggle.click()
  }
})
