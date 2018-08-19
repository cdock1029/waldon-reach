import React, { RefObject } from 'react'
import Dinero from 'dinero.js'

Dinero.globalLocale = 'en-US'
const FORMAT = '0,0'
const PRETTY = '$0,0.00'

interface MoneyInputProps {
  children(moneyRenderProps: {
    whole: string
    fraction: string
    money: string
    getWholeInputProps(
      wholeInputParams: WholeInputParams,
    ): WholeInputRenderProps
    getFractionInputProps(
      fractionInputParams: FractionInputParams,
    ): FractionInputRenderProps
  }): JSX.Element | JSX.Element[] | null
}
interface MoneyInputState {
  whole: string
  fraction: string
}

/* */
interface WholeInputParams {
  id?: string
  name?: string
  className?: string
  placeholder?: string
  autoFocus?: boolean
}

interface WholeInputRenderProps {
  value: string
  onChange(e: React.ChangeEvent<HTMLInputElement>): void
  className: string
  id: string
  name: string
  placeholder: string
  autoFocus: boolean
  ref: React.RefObject<HTMLInputElement>
}

interface FractionInputParams {
  className?: string
  id?: string
  name?: string
  placeholder?: string
  autoFocus?: boolean
}
interface FractionInputRenderProps {
  value: string
  onChange(e: React.ChangeEvent<HTMLInputElement>): void
  onKeydown(e: React.KeyboardEvent<HTMLInputElement>): void
  className: string
  id: string
  name: string
  placeholder: string
  autoFocus: boolean
  ref: React.RefObject<HTMLInputElement>
}

function to$(whole: string, fraction = '0', fmt = FORMAT) {
  return Dinero({
    amount: 100 * parseInt(whole || '0') + parseInt(fraction || '0'),
  }).toFormat(fmt)
}

export class MoneyInput extends React.Component<
  MoneyInputProps,
  MoneyInputState
> {
  static wholeRegex = /^\d+\.?\d{0,2}$/
  static fractionRegex = /^\d{1,2}$/
  static commasAndSpaces = /[,\s]/g

  static Whole = React.forwardRef<HTMLInputElement>(
    (
      {
        value,
        onChange,
        className = 'whole',
        id = 'whole',
        name = 'whole',
        placeholder = '0',
        autoFocus = false,
      }: {
        value: string
        onChange(): void
        children?: React.ReactNode
        className?: string
        id?: string
        name?: string
        placeholder?: string
        autoFocus?: boolean
      },
      ref,
    ) => (
      <input
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={className}
        autoFocus={autoFocus}
        placeholder={placeholder}
        ref={ref}
      />
    ),
  )
  static Fraction = React.forwardRef<HTMLInputElement>(
    (
      {
        value,
        onChange,
        onKeydown,
        className = 'fraction',
        id = 'fraction',
        name = 'fraction',
        placeholder = '00',
        autoFocus = false,
      }: {
        value: string
        onChange(): void
        onKeydown(): void
        children?: React.ReactNode
        className?: string
        id?: string
        name?: string
        placeholder?: string
        autoFocus?: boolean
      },
      ref,
    ) => (
      <input
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onKeyDown={onKeydown}
        className={className}
        placeholder={placeholder}
        autoFocus={autoFocus}
        ref={ref}
      />
    ),
  )

  wholeRef: RefObject<HTMLInputElement>
  fractionRef: RefObject<HTMLInputElement>

  constructor(props: any) {
    super(props)
    this.state = {
      whole: '0',
      fraction: '',
    }
    this.wholeRef = React.createRef()
    this.fractionRef = React.createRef()
  }

  handleWholeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { value } = e.target
    // undo Dinero
    value = value.toString().replace(MoneyInput.commasAndSpaces, '')
    if (value === '') {
      return this.setState({ whole: '0' })
    }

    if (!value.match(MoneyInput.wholeRegex)) {
      console.log('no match', { value })
      return
    }

    if (value.indexOf('.') !== -1) {
      const parts = value.split('.')
      const money = to$(parts[0])
      return this.setState(
        ({ fraction }) => ({
          whole: money,
          fraction: parts.length > 1 ? parts[1] : fraction,
        }),
        () => {
          this.fractionRef.current!.focus()
        },
      )
    }

    console.log('down here', { value })
    let fixed = value
    if (fixed.length > 1) {
      if (fixed.charAt(0) === '0') {
        fixed = fixed.substr(1)
      }
    }
    const money = to$(fixed)
    console.log({ fixed, money })
    this.setState({ whole: money })
  }
  handleFractionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    // console.log({fraction: value})
    if (value.trim() === '') {
      return this.setState({ fraction: value.trim() }, () => {
        this.wholeRef.current!.focus()
      })
    }
    if (!value.match(MoneyInput.fractionRegex)) {
      return
    }
    this.setState({ fraction: value })
  }
  fractionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { value } = this.fractionRef.current!
    if (value === '' && e.keyCode === 8) {
      this.wholeRef.current!.focus()
    }
  }

  getWholeInputProps = ({
    id = 'whole',
    name = 'whole',
    className = 'whole',
    placeholder = '0',
    autoFocus = false,
    ...rest
  }: WholeInputParams): WholeInputRenderProps => {
    const {
      state: { whole },
      handleWholeChange: onChange,
      wholeRef: ref,
    } = this
    return {
      value: whole,
      onChange,
      className,
      id,
      name,
      placeholder,
      autoFocus,
      ref,
      // TODO should we?
      ...rest,
    }
  }
  getFractionInputProps = ({
    className = 'fraction',
    id = 'fraction',
    name = 'fraction',
    placeholder = '00',
    autoFocus = false,
    ...rest
  }: FractionInputParams): FractionInputRenderProps => {
    const {
      state: { fraction },
      handleFractionChange: onChange,
      fractionKeyDown: onKeydown,
      fractionRef: ref,
    } = this
    return {
      value: fraction,
      id,
      name,
      onChange,
      onKeydown,
      className,
      placeholder,
      autoFocus,
      ref,
    }
  }

  render() {
    const { children } = this.props
    const { whole, fraction } = this.state
    const { getWholeInputProps, getFractionInputProps } = this
    const money = to$(whole.replace(',', ''), fraction, PRETTY)
    return children({
      whole,
      fraction,
      money,
      getWholeInputProps,
      getFractionInputProps,
    })
  }
}
