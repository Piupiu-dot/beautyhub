// Kanonische Nischen-Keys (werden in posts.nischen gespeichert & für tester_sieht_nische-Matching genutzt)
export const NISCHEN = [
  { key: 'laser', label: 'Laser & IPL' },
  { key: 'gesicht', label: 'Gesicht & Haut' },
  { key: 'nagel', label: 'Nails' },
  { key: 'pmu', label: 'PMU' },
  { key: 'wimpern', label: 'Lashes & Brows' },
  { key: 'haar', label: 'Haare' },
  { key: 'med', label: 'Medizinisch' },
]

export const nischeLabel = (k: string) => NISCHEN.find(n => n.key === k)?.label || k
