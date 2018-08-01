import React from 'react'
import { BooleanValue } from 'react-values'

const Zen = React.createContext<{ value: boolean; toggle(): void }>({
  value: true,
  toggle: () => {},
})
export const ZenProvider: React.SFC = ({ children }) => (
  <BooleanValue>
    {(data: { value: boolean; toggle(): void }) => (
      <Zen.Provider value={data}>{children}</Zen.Provider>
    )}
  </BooleanValue>
)
export const ZenConsumer = Zen.Consumer
