import { expect, test } from '@playwright/test'
import { catalanSolids, getSolid } from '../../src/data/solids'
import { setTransformationTime, clickControl } from './controls'

for (const solid of catalanSolids) {
  test(`${solid.name} has a selectable model, full properties, and a reversible dual`, async ({ page })=>{
    const parent=getSolid(solid.dualId!)
    await page.goto(`./?solid=${parent.id}`)
    await setTransformationTime(page,0.5)
    await page.getByRole('button',{name:'Dual',exact:true}).click()
    await expect(page.getByRole('heading',{name:solid.name,exact:true})).toBeVisible()
    for (const [label,value] of [['Faces',solid.faces],['Edges',solid.edges],['Vertices',solid.vertices]] as const) await expect(page.getByTestId('solid-summary').locator(`[data-property="${label}"]`)).toContainText(String(value))
    const more=page.getByRole('button',{name:'Show all properties'})
    if (await more.isVisible()) await more.click()
    await expect(page.getByTestId('solid-summary').locator('[data-property="Dual"]')).toContainText(parent.name)
    await expect(page.getByTestId('solid-summary').locator('[data-property="Face types"]')).toContainText(solid.faceBreakdown!)
    await page.getByRole('button',{name:'Highlight faces'}).click()
    await expect(page.getByLabel(`Interactive 3D model of a ${solid.name}`)).toHaveAttribute('data-highlight','faces')
    await page.screenshot({path:test.info().outputPath('catalan-solid.png')})
    await page.reload()
    await expect(page.getByRole('heading',{name:solid.name,exact:true})).toBeVisible()
    await clickControl(page, 'Map')
    const map=page.getByRole('dialog',{name:'Transformation map'})
    await expect(map.getByRole('button',{name:`Inspect ${solid.name}`,exact:true})).toHaveAccessibleDescription('Catalan')
    await expect(map.getByRole('button',{name:`Inspect ${solid.name}`,exact:true}).locator('[data-family-label]')).toHaveText('Catalan')
    await expect(map.getByRole('button',{name:`Inspect ${parent.name}`,exact:true}).locator('[data-family-label]')).toHaveText('Archimedean')
    await map.getByRole('button',{name:`Dual → ${parent.name}`,exact:true}).click()
    await expect(page.getByRole('heading',{name:parent.name,exact:true})).toBeVisible()
    await expect(page.getByRole('button',{name:'Highlight faces'})).toHaveAttribute('aria-pressed','false')
  })
}
