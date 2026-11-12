import { expect, test } from '@playwright/test'
import { starSolids, getSolid } from '../../src/data/solids'
import { setTransformationTime } from './controls'

for (const solid of starSolids) test(`${solid.name} dual has stable seekable surface frames and reverses`, async ({page,isMobile})=>{
  test.slow(Boolean(process.env.CI) && isMobile, 'The hosted software renderer seeks three star-surface frames and reverses the path')
  await page.goto(`./?solid=${solid.id}`)
  await setTransformationTime(page,0.5)
  await page.getByRole('button',{name:'Dual',exact:true}).click()
  await expect(page.getByRole('heading',{name:getSolid(solid.dualId!).name,exact:true})).toBeVisible()
  const progress=page.getByRole('slider',{name:/Transformation progress/})
  for (const value of [0.2,0.5,0.8]) {
    await progress.fill(String(value))
    await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))))
    if (value===0.5) {
      // One viewport capture avoids repeated element-stability waits on software WebGL.
      await page.screenshot({path:test.info().outputPath('star-dual-midpoint.png'),animations:'disabled'})
      await page.getByRole('button',{name:'Explain this transformation'}).click()
      await expect(page.getByRole('dialog')).toContainText('without repeatedly revealing different intersecting sheets')
      await page.getByRole('button',{name:'Close',exact:true}).click()
    }
  }
  await page.getByRole('button',{name:'Go to transformation end'}).click()
  await page.getByRole('button',{name:'Dual',exact:true}).click()
  await expect(page.getByRole('heading',{name:solid.name,exact:true})).toBeVisible()
})
