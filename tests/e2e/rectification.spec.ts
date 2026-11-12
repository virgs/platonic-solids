import { expect, test } from '@playwright/test'
import { setTransformationTime } from './controls'

for (const [from,origin,target] of [
  ['tetrahedron','Tetrahedron','Octahedron'],
  ['cube','Cube','Cuboctahedron'],
  ['octahedron','Octahedron','Cuboctahedron'],
  ['dodecahedron','Dodecahedron','Icosidodecahedron'],
  ['icosahedron','Icosahedron','Icosidodecahedron'],
] as const) {
  test(`${origin} rectifies to ${target}, holds a cut, and reverses`, async ({ page }) => {
    await page.goto(`./?solid=${from}`)
    await setTransformationTime(page,0.5)
    await page.getByRole('button', { name: 'Rectify', exact: true }).click()
    await expect(page.getByRole('heading', { name: target, exact: true })).toBeVisible()
    await expect(page).toHaveURL(new RegExp(`solid=${target.toLowerCase()}`))
    const progress = page.getByRole('slider', { name: /Transformation progress/ })
    await progress.fill('0.5')
    await expect(page.locator('#solid-selector')).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Play transformation', exact: true })).toBeVisible()
    await page.screenshot({ path: test.info().outputPath('rectification-midpoint.png') })
    await page.getByRole('button', { name: 'Explain this transformation' }).click()
    await expect(page.getByRole('dialog')).toContainText('midpoint of each incident edge')
    await page.getByRole('button', { name: 'Close', exact: true }).click()
    await page.getByRole('button', { name: 'Go to transformation end' }).click()
    await page.getByRole('button', { name: 'Play transformation', exact: true }).click()
    await expect(page.getByRole('heading', { name: origin, exact: true })).toBeVisible()
  })
}

for (const [id,name,faces,edges,vertices,breakdown,angles,pattern,dual,parents] of [
  ['cuboctahedron','Cuboctahedron',14,24,12,'8 triangles · 6 squares','Triangle 60° · square 90°','3.4.3.4','Rhombic dodecahedron',['Cube','Octahedron']],
  ['icosidodecahedron','Icosidodecahedron',32,60,30,'20 triangles · 12 pentagons','Triangle 60° · pentagon 108°','3.5.3.5','Rhombic triacontahedron',['Dodecahedron','Icosahedron']],
] as const) {
  test(`${name} is selectable, reports mixed face types, and exposes both parents`, async ({ page }) => {
    await page.goto('./')
    await expect(page).toHaveTitle('Polyhedra Explorer')
    await expect(page.getByRole('link', { name: 'Polyhedra Explorer', exact: true })).toBeVisible()
    await page.locator('#solid-selector').click()
    await page.getByRole('button', { name, exact: true }).click()
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
    for (const [label,value] of [['Faces',faces],['Edges',edges],['Vertices',vertices]] as const) {
      await expect(page.getByText(label,{ exact: true }).locator('..')).toContainText(String(value))
    }
    const more = page.getByRole('button', { name: 'Show all properties' })
    if (await more.isVisible()) await more.click()
    for (const value of [breakdown,angles,pattern,dual]) await expect(page.getByText(value,{ exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Dual', exact: true })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Unrectify', exact: true })).toBeEnabled()
    await page.getByRole('button', { name: 'Choose rectification destination' }).click()
    for (const parent of parents) await expect(page.getByRole('button', { name: `Unrectify → ${parent}`, exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Choose rectification destination' }).click()
    await page.screenshot({ path: test.info().outputPath('rectified-solid-hud.png') })
    await page.goto('./')
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
    await expect(page).toHaveURL(new RegExp(`solid=${id}`))
    await setTransformationTime(page,0.5)
    await page.getByRole('button', { name: 'Map', exact: true }).click()
    const map = page.getByRole('dialog', { name: 'Transformation map' })
    await expect(map.getByRole('button', { name: /^Inspect / })).toHaveCount(14)
    for (const parent of parents) await expect(map.getByRole('button', { name: `Unrectify → ${parent}`, exact: true })).toBeEnabled()
    await map.getByRole('button', { name: `Unrectify → ${parents[1]}`, exact: true }).click()
    await expect(page.getByRole('heading', { name: parents[1], exact: true })).toBeVisible()
  })
}
