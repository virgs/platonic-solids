import { expect, type Page } from '@playwright/test'

export async function setTransformationTime(page: Page, seconds: 0.5 | 4) {
  const button = page.getByRole('button', { name: 'Adjust transformation time', exact: true })
  await button.click()
  const slider = page.getByRole('slider', { name: 'Transformation time', exact: true })
  await slider.focus()
  await slider.press(seconds === 0.5 ? 'Home' : 'End')
  if (seconds === 4) for (let i=0;i<12;i++) await slider.press('PageDown')
  await expect(slider).toHaveAttribute('aria-valuenow',String(seconds))
  await button.click()
}

export async function openNavigation(page: Page) {
  const toggle=page.getByRole('button',{name:'Open navigation menu',exact:true})
  if (await toggle.getAttribute('aria-expanded')!=='true') await toggle.click()
}

export async function clickControl(page: Page, name: string) {
  const button=page.getByRole('button',{name,exact:true})
  if (!await button.isVisible()) await openNavigation(page)
  await button.click()
}

export async function chooseSolid(page: Page, id: string) {
  await page.locator('#solid-selector').click()
  await page.getByRole('listbox',{name:'Solid catalog',exact:true}).selectOption(id)
}

export async function chooseStellation(page: Page, name: string) {
  const choices=page.getByRole('button',{name:'Choose stellation destination',exact:true})
  if (await choices.isVisible()) {
    await choices.click()
    await page.getByRole('button',{name,exact:true}).click()
  } else await page.getByRole('button',{name:/^(Unstellate|Stellate)$/}).click()
}
