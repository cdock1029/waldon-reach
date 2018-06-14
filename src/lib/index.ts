export const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
})

export function notEmpty(...strs: string[]) {
  return strs.every(str => !!str)
}

export const isPartiallyActive = (classes: string) => ({
  isPartiallyCurrent,
}: any) => {
  return isPartiallyCurrent ? { className: `${classes} active` } : null
}

export const isActive = (classes: string) => ({ isCurrent }: any) => {
  return isCurrent ? { className: `${classes} active` } : null
}
