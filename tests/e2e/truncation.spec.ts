import { expect, test } from '@playwright/test'
import { setTransformationTime } from './controls'

for (const [parent,name,breakdown,angles,dual] of [
  ['Tetrahedron','Truncated tetrahedron','4 triangles · 4 hexagons','Triangle 60° · hexagon 120°','Triakis tetrahedron'],
  ['Cube','Truncated cube','8 triangles · 6 octagons','Triangle 60° · octagon 135°','Triakis octahedron'],
  ['Octahedron','Truncated octahedron','6 squares · 8 hexagons','Square 90° · hexagon 120°','Tetrakis hexahedron'],
] as const) {
  test(`${parent} truncates into ${name}, scrubs, reverses, and exposes complete properties`, async ({ page }) => {
    await page.goto(`./?solid=${parent.toLowerCase()}`)
    await setTransformationTime(page,0.5)
    await page.getByRole('button', { name: 'Truncate', exact: true }).click()
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Untruncate', exact: true })).toBeEnabled()
    const more = page.getByRole('button', { name: 'Show all properties' })
    if (await more.isVisible()) await more.click()
    for (const value of [breakdown,angles,dual]) await expect(page.getByText(value,{exact:true})).toBeVisible()
    await expect(page.getByTestId('solid-summary').locator('[data-property="Dihedral"]')).toHaveAttribute('title', /–.*°/)
    await page.getByRole('button', { name: 'Highlight vertices', exact: true }).click()
    await expect(page.getByLabel(`Interactive 3D model of a ${name}`)).toHaveAttribute('data-highlight','vertices')
    const progress=page.getByRole('slider',{name:/Transformation progress/})
    await progress.fill('0.5')
    await expect(page.getByRole('button', { name: 'Untruncate', exact: true })).toBeDisabled()
    await page.getByRole('button',{name:'Explain this transformation'}).click()
    await expect(page.getByRole('dialog')).toContainText('when every edge has equal length')
    await page.getByRole('button',{name:'Close',exact:true}).click()
    await page.getByRole('button',{name:'Go to transformation end'}).click()
    await page.screenshot({path:test.info().outputPath('truncated-solid.png')})
    await page.reload()
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
    await page.getByRole('button',{name:'Map',exact:true}).click()
    const map=page.getByRole('dialog',{name:'Transformation map'})
    await expect(map.getByRole('button',{name:/^Inspect /})).toHaveCount(14)
    await map.getByRole('button',{name:`Untruncate → ${parent}`,exact:true}).click()
    await expect(page.getByRole('heading',{name:parent,exact:true})).toBeVisible()
  })
}
