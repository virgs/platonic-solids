/** Keep the 42° field of view on the shorter canvas dimension.
 * A taller portrait canvas must not crop the model horizontally. Zoom remains
 * the camera's distance from the solid, independent of viewport layout.
 */
export function viewerFieldOfView(width: number, height: number) {
  if (width<=0 || height<=0) return 42
  const radians=Math.PI/180
  return 2*Math.atan(Math.tan(21*radians)/Math.min(1,width/height))/radians
}
