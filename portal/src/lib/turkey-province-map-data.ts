import provinceGeoJson from './turkey-provinces.geojson.json'

type Coordinate = [number, number]
type PolygonCoordinates = Coordinate[][]

interface ProvinceFeature {
  type: 'Feature'
  properties: {
    ID: number
    ADI: string
  }
  geometry: {
    type: 'Polygon' | 'MultiPolygon'
    coordinates: PolygonCoordinates | PolygonCoordinates[]
  }
}

interface ProvinceFeatureCollection {
  type: 'FeatureCollection'
  features: ProvinceFeature[]
}

export interface TurkeyProvinceGeometry {
  plateCode: number
  sourceName: string
  path: string
  labelX: number
  labelY: number
}

export const TURKEY_PROVINCE_GEOMETRY_SOURCE =
  'T.C. Tarım ve Orman Bakanlığı CBS · TATUS İl Sınırları katmanı'

const MAP_WIDTH = 900
const MAP_HEIGHT = 380
const MAP_PADDING = 24
const MIN_LONGITUDE = 25.666
const MAX_LONGITUDE = 44.818
const MIN_LATITUDE = 35.808
const MAX_LATITUDE = 42.105
const LONGITUDE_SCALE = Math.cos((39 * Math.PI) / 180)

const projectedWidth = (MAX_LONGITUDE - MIN_LONGITUDE) * LONGITUDE_SCALE
const projectedHeight = MAX_LATITUDE - MIN_LATITUDE
const projectionScale = Math.min(
  (MAP_WIDTH - MAP_PADDING * 2) / projectedWidth,
  (MAP_HEIGHT - MAP_PADDING * 2) / projectedHeight,
)
const projectionOffsetX = (MAP_WIDTH - projectedWidth * projectionScale) / 2
const projectionOffsetY = (MAP_HEIGHT - projectedHeight * projectionScale) / 2

function project([longitude, latitude]: Coordinate): Coordinate {
  return [
    projectionOffsetX + (longitude - MIN_LONGITUDE) * LONGITUDE_SCALE * projectionScale,
    projectionOffsetY + (MAX_LATITUDE - latitude) * projectionScale,
  ]
}

function asPolygons(feature: ProvinceFeature): PolygonCoordinates[] {
  return feature.geometry.type === 'Polygon'
    ? [feature.geometry.coordinates as PolygonCoordinates]
    : feature.geometry.coordinates as PolygonCoordinates[]
}

function createPath(polygons: PolygonCoordinates[]): string {
  return polygons
    .flatMap((polygon) => polygon.map((ring) => {
      const projectedRing = ring.map(project)
      if (projectedRing.length === 0) return ''

      const [firstPoint, ...remainingPoints] = projectedRing
      return [
        `M${firstPoint[0].toFixed(1)},${firstPoint[1].toFixed(1)}`,
        ...remainingPoints.map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`),
        'Z',
      ].join(' ')
    }))
    .filter(Boolean)
    .join(' ')
}

function ringArea(ring: Coordinate[]): number {
  return Math.abs(ring.reduce((area, point, index) => {
    const nextPoint = ring[(index + 1) % ring.length]
    return area + point[0] * nextPoint[1] - nextPoint[0] * point[1]
  }, 0) / 2)
}

function findLabelPosition(polygons: PolygonCoordinates[]): Coordinate {
  const largestOuterRing = polygons
    .map((polygon) => polygon[0])
    .filter((ring): ring is Coordinate[] => Boolean(ring?.length))
    .sort((left, right) => ringArea(right) - ringArea(left))[0]

  if (!largestOuterRing) return [MAP_WIDTH / 2, MAP_HEIGHT / 2]

  const projectedRing = largestOuterRing.map(project)
  const bounds = projectedRing.reduce(
    (current, [x, y]) => ({
      minX: Math.min(current.minX, x),
      maxX: Math.max(current.maxX, x),
      minY: Math.min(current.minY, y),
      maxY: Math.max(current.maxY, y),
    }),
    {
      minX: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
    },
  )

  return [
    (bounds.minX + bounds.maxX) / 2,
    (bounds.minY + bounds.maxY) / 2,
  ]
}

const source = provinceGeoJson as unknown as ProvinceFeatureCollection

export const turkeyProvinceGeometries: TurkeyProvinceGeometry[] = source.features
  .map((feature) => {
    const polygons = asPolygons(feature)
    const [labelX, labelY] = findLabelPosition(polygons)

    return {
      plateCode: feature.properties.ID,
      sourceName: feature.properties.ADI,
      path: createPath(polygons),
      labelX,
      labelY,
    }
  })
  .sort((left, right) => left.plateCode - right.plateCode)

