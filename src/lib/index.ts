export const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
})

export function notEmpty(...strs: string[]) {
  return strs.every(str => !!str)
}
