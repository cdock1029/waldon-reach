import React from 'react'
import { AnyValue } from 'react-values'

interface SharedProps<T> {
  // defaultValue?: T
  // value?: T
  // onChange?(value: T): void
  children(params: {
    value: T
    set(value: T): void
  }): JSX.Element | JSX.Element[] | null
  storageKey: string
}
interface SharedState<T> {
  value: T
}
type SharedEvent = CustomEvent<{ storageKey: string }>
export class SharedValue<T> extends React.Component<
  SharedProps<T>,
  SharedState<T>
> {
  event: SharedEvent
  constructor(props: SharedProps<T>) {
    super(props)
    this.event = new CustomEvent(props.storageKey, {
      detail: { storageKey: props.storageKey },
    })
  }

  componentDidMount() {
    document.addEventListener(this.props.storageKey, this.handleEvent, false)
  }
  componentWillUnmount() {
    document.removeEventListener(this.props.storageKey, this.handleEvent)
  }
  performStorageUpdate = (value: T) => {
    console.log('performing storage update:', { value })
    window.localStorage.setItem(this.props.storageKey, JSON.stringify(value))
    document.dispatchEvent(this.event)
  }
  handleEvent = (e: SharedEvent) => {
    const { storageKey } = e.detail
    console.log('handling storage update inside listener', { storageKey })
    if (storageKey === this.props.storageKey) {
      this.forceUpdate()
    }
  }
  render() {
    const { storageKey, children } = this.props
    const storedValue = window.localStorage.getItem(storageKey)
    const value = storedValue ? JSON.parse(storedValue) : undefined
    return (
      <AnyValue
        value={value}
        onChange={this.performStorageUpdate}
        children={children}
      />
    )
  }
}
