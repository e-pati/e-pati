/**
 * VetCep — Sentetik bölgesel sağlık veri kümesi
 *
 * ÖNEMLİ: Bu dosyadaki tüm değerler tamamen kurgusaldır ve deterministik bir
 * üreteçle oluşturulur. Hiçbir kamu kaynağından alınmamıştır, gerçek hayvan
 * sağlığı istatistiği değildir ve gerçek veri yerine kullanılamaz.
 *
 * Amaç, ürünün karar-destek yüzeyini gerçek veriye ihtiyaç duymadan tutarlı
 * biçimde gösterebilmektir. Landing sayfasındaki harita renkleri ve tüm KPI
 * değerleri bu kümeden hesaplanır; dekoratif/rastgele renk ataması yapılmaz.
 */

import { turkeyProvinceGeometries } from './turkey-province-map-data'

export const SYNTHETIC_DATASET_VERSION = 'v1.0'
export const SYNTHETIC_DATASET_DATE = 'Temmuz 2026'
export const SYNTHETIC_DATASET_LABEL = 'Sentetik veri kümesi'

export type RiskLevel = 'izlenen' | 'orta' | 'iyi'

export interface ProvinceHealthRecord {
  plateCode: number
  provinceName: string
  /** Kurgusal aşılama kapsamı yüzdesi (0-100). */
  vaccinationRate: number
  /** Kurgusal kayıtlı hayvan popülasyonu. */
  animalPopulation: number
  /** Kurgusal açık sinyal sayısı. */
  activeSignalCount: number
  /** vaccinationRate ve activeSignalCount değerlerinden türetilir. */
  riskLevel: RiskLevel
}

/**
 * Deterministik sözde-rastgele üreteç (mulberry32).
 * Sabit tohum sayesinde küme her derlemede birebir aynı kalır; harita
 * yenilendiğinde renkler değişmez.
 */
function createSeededRandom(seed: number) {
  let state = seed

  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Aşılama kapsamı ve açık sinyal sayısından risk seviyesi türetir. */
function deriveRiskLevel(vaccinationRate: number, activeSignalCount: number): RiskLevel {
  if (vaccinationRate < 78 || activeSignalCount >= 4) return 'izlenen'
  if (vaccinationRate < 88 || activeSignalCount >= 2) return 'orta'
  return 'iyi'
}

const random = createSeededRandom(20260731)

export const syntheticProvinceHealth: ProvinceHealthRecord[] = turkeyProvinceGeometries.map(
  (province) => {
    const vaccinationRate = Math.round(72 + random() * 26)
    const animalPopulation = Math.round(18_000 + random() * 240_000)
    // Düşük kapsamlı illerde sinyal sayısının artması için ters ilişki kurulur.
    const signalPressure = (100 - vaccinationRate) / 100
    const activeSignalCount = Math.round(random() * 5 * signalPressure * 1.6)

    return {
      plateCode: province.plateCode,
      provinceName: province.sourceName,
      vaccinationRate,
      animalPopulation,
      activeSignalCount,
      riskLevel: deriveRiskLevel(vaccinationRate, activeSignalCount),
    }
  },
)

const byPlateCode = new Map(syntheticProvinceHealth.map((record) => [record.plateCode, record]))

export function getProvinceHealth(plateCode: number): ProvinceHealthRecord | undefined {
  return byPlateCode.get(plateCode)
}

/** Harita lejantı — renkler ve anlamları tek kaynaktan gelir. */
export const riskLevelLegend: Array<{ level: RiskLevel; label: string; color: string }> = [
  { level: 'iyi', label: 'Yüksek kapsam', color: '#0f766e' },
  { level: 'orta', label: 'Orta kapsam', color: '#2dd4bf' },
  { level: 'izlenen', label: 'İzlenen bölge', color: '#f59e0b' },
]

const riskColorMap = new Map(riskLevelLegend.map((item) => [item.level, item.color]))

export function getRiskColor(level: RiskLevel): string {
  return riskColorMap.get(level) ?? '#0f766e'
}

/** Landing KPI'ları — hepsi kümeden hesaplanır, sabit metin değildir. */
export const syntheticHealthSummary = {
  provinceCount: syntheticProvinceHealth.length,
  averageVaccinationRate: Math.round(
    syntheticProvinceHealth.reduce((total, item) => total + item.vaccinationRate, 0) /
      syntheticProvinceHealth.length,
  ),
  monitoredProvinceCount: syntheticProvinceHealth.filter((item) => item.riskLevel === 'izlenen')
    .length,
  totalActiveSignals: syntheticProvinceHealth.reduce(
    (total, item) => total + item.activeSignalCount,
    0,
  ),
}
