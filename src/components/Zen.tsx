import React from 'react'
import { BooleanValue } from 'react-values'

const Zen = React.createContext<{ value: boolean; toggle(): void }>({
  value: true,
  toggle: () => {},
})
export const ZenProvider: React.SFC = ({ children }) => {
  return (
    <BooleanValue
      defaultValue={window.localStorage.getItem('wpm.zen') === 'true'}
      onChange={(value: boolean) =>
        window.localStorage.setItem('wpm.zen', value.toString())
      }>
      {(data: { value: boolean; toggle(): void }) => (
        <Zen.Provider value={data}>{children}</Zen.Provider>
      )}
    </BooleanValue>
  )
}
export const ZenConsumer = Zen.Consumer
