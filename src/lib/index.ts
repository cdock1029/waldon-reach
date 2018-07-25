export const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
})

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
