import React, { RefObject } from 'react'
import Dinero from 'dinero.js'
import styled from 'react-emotion'

Dinero.globalLocale = 'en-US'
const FORMAT = '0,0'
const PRETTY = '$0,0.00'

function split(amount: number): { whole: number; fraction: number } {
  const fraction = amount % 100
  const whole = (amount - fraction) / 100
  return { whole, fraction }
}

interface MoneyInputProps {
  defaultValue?: number
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
    clear(): void
  }): JSX.Element | JSX.Element[] | null
  onChange?(updatedState: MoneyInputState & { total: number }): void
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
  onFocus?(e: React.FocusEvent<HTMLInputElement>): void
  onClick?(e: React.MouseEvent<HTMLInputElement>): void
  onMouseDown?(e: React.MouseEvent<HTMLInputElement>): void
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
  onKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void
  className: string
  id: string
  name: string
  placeholder: string
  autoFocus: boolean
  ref: React.RefObject<HTMLInputElement>
}

function stringToTotalInt(whole: string, fraction: string): number {
  return 100 * parseInt(whole || '0') + parseInt(fraction || '0')
}

function to$(whole: string, fraction = '0', fmt = FORMAT) {
  return Dinero({
    amount: stringToTotalInt(whole, fraction),
  }).toFormat(fmt)
}

const StyledInput = styled.input((props: any) => ({
  backgroundColor: props.bg || 'inherit',
  display: 'inline-flex',
  padding: 0,
  maxWidth: '5em',
  border: 'none',
  borderBottom: '1px solid black',
}))

const WholeStyledInput = styled(StyledInput)({
  textAlign: 'right',
  fontSize: '2em',
  marginRight: '0.5em',
  '&.touched': {
    caretColor: 'transparent',
  },
})

const FractionStyledInput = styled(StyledInput)({
  maxWidth: '2em',
  fontSize: '1.4em',
})

export class MoneyInput extends React.Component<
  MoneyInputProps,
  MoneyInputState
> {
  static wholeRegex = /^\d+\.?\d{0,2}$/
  static fractionRegex = /^\d{1,2}$/
  static commasAndSpaces = /[,\s]/g

  static Whole = React.forwardRef<HTMLInputElement>((props: any, ref) => (
    <WholeStyledInput type="tel" {...props} innerRef={ref} />
  ))
  static Fraction = React.forwardRef<HTMLInputElement>((props: any, ref) => (
    <FractionStyledInput type="tel" {...props} innerRef={ref} />
  ))

  static defaultProps: Pick<MoneyInputProps, 'defaultValue'> = {
    defaultValue: 0,
  }

  wholeRef: RefObject<HTMLInputElement>
  fractionRef: RefObject<HTMLInputElement>

  constructor(props: MoneyInputProps) {
    super(props)
    const initial = split(props.defaultValue!)
    this.state = {
      whole: initial.whole.toString(),
      fraction: initial.fraction ? initial.fraction.toString() : '',
    }
    this.wholeRef = React.createRef()
    this.fractionRef = React.createRef()
  }

  internalSetState = (
    data:
      | Partial<MoneyInputState>
      | ((curr: Readonly<MoneyInputState>) => Partial<MoneyInputState> | null),
    cb?: () => void,
  ): void => {
    let stateToSet: Partial<MoneyInputState> | null
    this.setState(
      state => {
        if (typeof data === 'function') {
          stateToSet = data(state)
        } else {
          stateToSet = data
        }
        return stateToSet as Pick<MoneyInputState, 'fraction' | 'whole'>
      },
      () => {
        if (cb) {
          cb()
        }
        if (this.props.onChange && stateToSet !== null) {
          const { whole, fraction } = this.state
          const total = stringToTotalInt(whole, fraction)
          this.props.onChange({ whole, fraction, total })
        }
      },
    )
  }

  handleWholeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { value } = e.target
    console.log('whole Change', { value })
    // undo Dinero
    value = value.toString().replace(MoneyInput.commasAndSpaces, '')
    if (value === '') {
      return this.internalSetState(() => ({ whole: '0' }))
    }

    if (!value.match(MoneyInput.wholeRegex)) {
      console.log('no match', { value })
      return
    }

    if (value.indexOf('.') !== -1) {
      const parts = value.split('.')
      const money = to$(parts[0])
      console.log({ parts, money, fraction: this.state.fraction })
      return this.internalSetState(
        ({ fraction }) => ({
          whole: money,
          fraction: parts[1] ? parts[1] : fraction,
        }),
        () => {
          console.log({ fRef: this.fractionRef })
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
    this.internalSetState(() => ({ whole: money }))
  }
  handleFractionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    console.log('fracChange', { value })
    if (value.trim() === '') {
      console.log('fraction is empty.. setting then jumping to whole')
      return this.internalSetState(
        () => ({ fraction: '' }),
        () => {
          this.wholeRef.current!.focus()
        },
      )
    }
    if (value.match(MoneyInput.fractionRegex)) {
      this.internalSetState(() => ({ fraction: value }))
    }
  }
  fractionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const node = this.fractionRef.current!
    const { key } = e
    console.log('fracKeyDown', { value: node.value, key })
    if (node.value === '' && key === 'Backspace') {
      // hack: TODO: FIX?: without timeout, immediately after focus
      // the "whole" input value gets a digit removed
      // ....backspace is applied to it, instead of *just* to this input
      // shows up in vanilla html in chrome and safari so... whatever.
      setTimeout(() => {
        this.wholeRef.current!.focus()
      }, 0)
    }
  }
  wholeOnFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    console.log('whole onFocus')
    // const node = this.wholeRef.current!
    // node.focus()
    // node.setSelectionRange(1000, 1000)
  }
  wholeOnMouseDown = (e: React.MouseEvent<HTMLInputElement>) => {
    console.log('mouse down')
    const node = this.wholeRef.current!
    node.classList.add('touched')
    node.focus()
    // node caret-color: red;
    node.setSelectionRange(1000, 1000)
  }
  wholeOnClick = (e: React.MouseEvent<HTMLInputElement>) => {
    console.log('clicked')
    const node = this.wholeRef.current!
    node.focus()
    node.setSelectionRange(1000, 1000)
    node.classList.remove('touched')
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
      wholeOnFocus: onFocus,
      wholeOnClick: onClick,
      wholeOnMouseDown: onMouseDown,
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
      onClick,
      onFocus,
      onMouseDown,
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
      fractionKeyDown: onKeyDown,
      fractionRef: ref,
    } = this
    return {
      value: fraction,
      id,
      name,
      onChange,
      onKeyDown,
      className,
      placeholder,
      autoFocus,
      ref,
      ...rest,
    }
  }
  clear = () => {
    this.internalSetState(
      () => ({ whole: '0', fraction: '' }),
      () => {
        this.wholeRef.current!.focus()
      },
    )
  }

  render() {
    const { children } = this.props
    const { whole, fraction } = this.state
    const { getWholeInputProps, getFractionInputProps, clear } = this
    const money = to$(whole.replace(',', ''), fraction, PRETTY)
    return children({
      whole,
      fraction,
      money,
      getWholeInputProps,
      getFractionInputProps,
      clear,
    })
  }
}
