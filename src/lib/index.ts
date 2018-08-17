export const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
})

export const sortUnits = (uns: Unit[]) =>
  uns.sort((a, b) => collator.compare(a.label, b.label))

export function notEmpty(...strs: string[]) {
  return strs.every(str => !!str)
}

export const CurrencyAddDecimals = (num: number) => {
  const dec = num / 100.0
  return dec.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })
}

export function notBuilding() {
  return typeof document !== 'undefined'
}
