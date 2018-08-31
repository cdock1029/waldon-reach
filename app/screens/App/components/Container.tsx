import system from 'system-components/emotion'

export const Container = system(
  {
    p: [2, 3, 4, 5],
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  {
    overflowY: 'scroll',
  },
)
