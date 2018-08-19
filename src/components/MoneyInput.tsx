import React, { RefObject } from 'react'
import Dinero from 'dinero.js'
import styled from 'react-emotion'

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

function to$(whole: string, fraction = '0', fmt = FORMAT) {
  return Dinero({
    amount: 100 * parseInt(whole || '0') + parseInt(fraction || '0'),
  }).toFormat(fmt)
}

const StyledInput = styled.input({
  fontSize: '2em',
  textAlign: 'right',
  display: 'inline-flex',
  padding: 0,
  maxWidth: '5em',
  border: 'none',
  borderBottom: '1px solid black',
  marginRight: '0.5em',
  '&.touched': {
    caretColor: 'transparent',
  },
  // '&.untouched': {
  //   caretColor: 'black',
  // },
})

export class MoneyInput extends React.Component<
  MoneyInputProps,
  MoneyInputState
> {
  static wholeRegex = /^\d+\.?\d{0,2}$/
  static fractionRegex = /^\d{1,2}$/
  static commasAndSpaces = /[,\s]/g

  static Whole = React.forwardRef<HTMLInputElement>((props: any, ref) => (
    <StyledInput {...props} innerRef={ref} />
  ))
  static Fraction = React.forwardRef<HTMLInputElement>((props: any, ref) => (
    <input
      style={{
        maxWidth: '2em',
        display: 'inline-flex',
        fontSize: '1.4em',
        border: 'none',
        borderBottom: '1px solid black',
      }}
      {...props}
      ref={ref}
    />
  ))

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
    const { keyCode } = e
    if (value === '' && keyCode === 8) {
      this.wholeRef.current!.focus()
    }
  }
  wholeOnFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    console.log('focused')
    // const node = this.wholeRef.current!
    // node.focus()
    // node.setSelectionRange(1000, 1000)

    // this.setState(
    //   ({ whole }) => ({ whole: `${whole}${''}` }),
    //   () => {
    //     this.wholeRef.current!.setSelectionRange(1000, 1000)
    //   },
    // )
  }
  wholeOnClick = (e: React.MouseEvent<HTMLInputElement>) => {
    console.log('clicked')
    const node = this.wholeRef.current!
    node.focus()
    node.setSelectionRange(1000, 1000)
    node.classList.remove('touched')
  }
  wholeOnMouseDown = (e: React.MouseEvent<HTMLInputElement>) => {
    console.log('mouse down')
    const node = this.wholeRef.current!
    node.classList.add('touched')
    node.focus()
    // node caret-color: red;
    node.setSelectionRange(1000, 1000)
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

  render() {
    const { children } = this.props
    const { whole, fraction } = this.state
    const { getWholeInputProps, getFractionInputProps } = this
    const money = to$(whole.replace(',', ''), fraction, PRETTY)
    console.log('render: ', whole)
    return children({
      whole,
      fraction,
      money,
      getWholeInputProps,
      getFractionInputProps,
    })
  }
}
