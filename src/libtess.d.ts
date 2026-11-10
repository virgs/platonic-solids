declare module 'libtess' {
  interface Tessellator {
    gluTessCallback<T>(kind: number, callback: T): void
    gluTessProperty(kind: number, value: number): void
    gluTessBeginPolygon(data: unknown): void
    gluTessBeginContour(): void
    gluTessVertex(coords: number[], data: number[]): void
    gluTessEndContour(): void
    gluTessEndPolygon(): void
  }
  const libtess: {
    GluTesselator: new () => Tessellator
    gluEnum: Record<string, number>
    windingRule: Record<string, number>
  }
  export default libtess
}
