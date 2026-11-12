import { expect, test } from '@playwright/test'
import packageInfo from '../../package.json' with { type: 'json' }
import { openNavigation } from './controls'

test('view and transformation controls fit one equal-height row down to 320px', async ({page})=>{
  await page.goto('./?solid=dodecahedron')
  await page.getByRole('button',{name:'Toggle solid opacity'}).click()
  const opacity=page.getByRole('slider',{name:'Solid opacity',exact:true})
  await opacity.focus(); await opacity.press('End')
  await page.getByRole('button',{name:'Toggle solid opacity'}).click()
  for (const width of [320,360,393,768,1280]) {
    await page.setViewportSize({width,height:800})
    const toolbar=page.getByRole('toolbar',{name:'Solid controls'})
    const bounds=(await toolbar.boundingBox())!
    const view=(await toolbar.getByRole('group',{name:'Camera controls'}).boundingBox())!
    const actions=(await toolbar.getByRole('group',{name:'Solid transformations'}).boundingBox())!
    expect(Math.abs(view.y-actions.y),String(width)).toBeLessThan(1)
    expect(view.x+view.width,String(width)).toBeLessThanOrEqual(actions.x)
    expect(actions.x+actions.width,String(width)).toBeLessThanOrEqual(bounds.x+bounds.width+1)
    const heights=await toolbar.getByRole('button').evaluateAll(buttons=>buttons.filter(button=>button.getClientRects().length).map(button=>button.getBoundingClientRect().height))
    expect(Math.max(...heights)-Math.min(...heights),String(width)).toBeLessThan(1)
    const stage=(await page.getByLabel('Interactive 3D model of a Dodecahedron').boundingBox())!
    expect(stage.height,String(width)).toBeGreaterThan(800*0.55)
    expect(await page.evaluate(()=>document.documentElement.scrollHeight>innerHeight || document.documentElement.scrollWidth>innerWidth)).toBe(false)
    if (width===393) await page.screenshot({path:test.info().outputPath('single-row-mobile-hud.png')})
  }
})

test('the solid heading is the only picker and supports grouped keyboard selection',async({page})=>{
  await page.goto('./?solid=cube')
  const heading=page.getByRole('heading',{name:'Cube',exact:true})
  const picker=heading.getByRole('button',{name:'Choose a solid',exact:true})
  await expect(page.locator('#solid-selector')).toHaveCount(1)
  await picker.focus(); await picker.press('Enter')
  const catalog=page.getByRole('listbox',{name:'Solid catalog',exact:true})
  await expect(catalog).toBeVisible()
  await expect(catalog.locator('optgroup')).toHaveCount(4)
  await expect(catalog.locator('option')).toHaveCount(23)
  await catalog.press('Escape')
  await expect(catalog).not.toBeVisible()
  await expect(picker).toBeFocused()
  await picker.press('Enter')
  await catalog.selectOption('rhombic-triacontahedron')
  await expect(page.getByRole('heading',{name:'Rhombic triacontahedron',exact:true})).toBeVisible()
  await expect(page).toHaveURL(/solid=rhombic-triacontahedron/)
})

test('navbar menu contains navigation and the GitHub release identity',async({page})=>{
  await page.goto('./')
  await openNavigation(page)
  await expect(page.getByRole('button',{name:'Map',exact:true})).toBeVisible()
  await expect(page.getByRole('button',{name:'History',exact:true})).toBeVisible()
  const github=page.getByRole('link',{name:'GitHub',exact:true})
  await expect(github).toContainText(`v${packageInfo.version}`)
  await page.getByRole('button',{name:'Map',exact:true}).click()
  await expect(page.getByRole('dialog',{name:'Transformation map'})).toBeVisible()
  await page.getByRole('button',{name:'Close',exact:true}).click()
  await openNavigation(page)
  await page.getByRole('button',{name:'History',exact:true}).click()
  await expect(page.getByRole('dialog',{name:'Route history'})).toBeVisible()
})
