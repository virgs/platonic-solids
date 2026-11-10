import { expect, type Page } from '@playwright/test'

export async function setTransformationTime(page: Page, seconds: 0.5 | 4) {
  const button = page.getByRole('button', { name: 'Adjust transformation time', exact: true })
  await button.click()
  const slider = page.getByRole('slider', { name: 'Transformation time', exact: true })
  await slider.focus()
  await slider.press(seconds === 0.5 ? 'Home' : 'End')
  if (seconds === 4) for (let i=0;i<4;i++) await slider.press('PageDown')
  await expect(slider).toHaveAttribute('aria-valuenow',String(seconds))
  await button.click()
}
