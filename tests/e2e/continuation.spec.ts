import { expect, test } from '@playwright/test'
import { truncatedSolids } from '../../src/data/solids'
import { rectificationTargets } from '../../src/three/rectification'
import { getSolid } from '../../src/data/solids'
import { setTransformationTime } from './controls'

for (const solid of truncatedSolids) {
  test(`${solid.name} continues to its rectification and reverses to the truncated endpoint`, async ({page})=>{
    const target=getSolid(rectificationTargets[solid.id]!)
    await page.goto(`./?solid=${solid.id}`)
    await setTransformationTime(page,0.5)
    await page.getByRole('button',{name:'Rectify',exact:true}).click()
    await expect(page.getByRole('heading',{name:target.name,exact:true})).toBeVisible()
    await page.getByRole('slider',{name:/Transformation progress/}).fill('0.5')
    await expect(page.getByRole('button',{name:'Dual',exact:true})).toBeDisabled()
    await page.getByRole('button',{name:'Explain this transformation'}).click()
    await expect(page.getByRole('dialog')).toContainText('cuts continue to the original edge midpoints')
    await page.getByRole('button',{name:'Close',exact:true}).click()
    await page.getByRole('button',{name:'Go to transformation end'}).click()
    await page.getByRole('button',{name:'Choose rectification destination'}).click()
    await page.getByRole('button',{name:`Unrectify → ${solid.name}`,exact:true}).click()
    await expect(page.getByRole('heading',{name:solid.name,exact:true})).toBeVisible()
    await expect(page.getByRole('button',{name:'Untruncate',exact:true})).toBeEnabled()
  })
}
