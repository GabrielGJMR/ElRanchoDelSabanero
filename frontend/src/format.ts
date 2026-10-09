export const colones = (n: number): string => '₡' + n.toLocaleString('es-CR')

/** Para comparar texto en buscadores sin que importen mayúsculas ni tildes. */
export const normalize = (s: string): string =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
