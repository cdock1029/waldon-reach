import React, { ComponentClass } from 'react'
import Downshift, {
  DownshiftInterface,
  DownshiftProps,
  DownshiftState,
  ControllerStateAndHelpers,
} from 'downshift'
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  FormGroup,
  InputGroup,
  InputGroupAddon,
  Button,
  ButtonGroup,
} from 'reactstrap'

interface Props<T> {
  downshiftProps: Partial<DownshiftProps<T>>
  focusOnMount?: boolean
  focusOnUpdate?: boolean
  label: JSX.Element
  input: JSX.Element
  items: T[]
  itemsTransform?(
    items: T[],
    downshift: Partial<ControllerStateAndHelpers<T>>,
  ): T[]
  children(
    props: Partial<ControllerStateAndHelpers<T>> & { items: T[] },
  ): JSX.Element | JSX.Element[] | null
  setFieldTouched(): void
}

export function getDownshift<T>(): ComponentClass<Props<T>> {
  const TDownshift: DownshiftInterface<T> = Downshift

  return class DownshiftDropdown extends React.Component<Props<T>> {
    static defaultProps: Partial<Props<T>> = {
      itemsTransform: (items, { inputValue, itemToString }) => {
        return items.filter(
          item =>
            !inputValue ||
            itemToString!(item)
              .toUpperCase()
              .includes(inputValue.toUpperCase()),
        )
      },
      focusOnUpdate: false,
      focusOnMount: false,
    }
    input: React.RefObject<HTMLInputElement>
    constructor(props: Props<T>) {
      super(props)
      this.input = React.createRef()
    }
    componentDidMount() {
      if (this.props.focusOnMount) {
        this.input.current!.focus()
      }
    }
    componentDidUpdate() {
      if (this.props.focusOnUpdate) {
        this.input.current!.focus()
      }
    }
    noOp() {}
    render() {
      const {
        downshiftProps,
        label,
        input,
        children,
        items,
        itemsTransform,
        setFieldTouched,
      } = this.props
      return (
        <TDownshift {...downshiftProps}>
          {({
            getInputProps,
            getItemProps,
            getLabelProps,
            getMenuProps,
            openMenu,
            closeMenu,
            toggleMenu,
            isOpen,
            inputValue,
            highlightedIndex,
            selectedItem,
            itemToString,
          }) => {
            const transformedItems = itemsTransform!(items, {
              itemToString,
              inputValue,
            })
            return (
              <div>
                <Dropdown
                  isOpen={isOpen && transformedItems.length > 0}
                  toggle={this.noOp}>
                  <DropdownToggle
                    tag="div"
                    data-toggle="dropdown"
                    aria-expanded={isOpen}>
                    <FormGroup>
                      {React.cloneElement(label, { ...getLabelProps() })}
                      <InputGroup>
                        <InputGroupAddon addonType="prepend">
                          <Button
                            className="dropdown-toggle"
                            tabIndex={-1}
                            type="button"
                            disabled={items.length < 1}
                            onClick={toggleMenu as any}>
                            <span className="sr-only">Toggle Dropdown</span>
                          </Button>
                        </InputGroupAddon>
                        {React.cloneElement(input, {
                          ...getInputProps({
                            // onFocus: () => {
                            //   openMenu()
                            // },
                            onBlur: () => {
                              // validate()
                              setFieldTouched()
                              closeMenu()
                            },
                          }),
                          innerRef: this.input,
                        })}
                        <InputGroupAddon addonType="append">
                          <Button type="button" tabIndex={-1}>
                            New
                          </Button>
                        </InputGroupAddon>
                      </InputGroup>
                    </FormGroup>
                  </DropdownToggle>
                  <DropdownMenu
                    css={{
                      maxHeight: '20em',
                      overflowY: 'scroll',
                      marginLeft: '38px',
                    }}>
                    <div {...getMenuProps()}>
                      {children({
                        getItemProps: params =>
                          getItemProps({
                            style: {
                              backgroundColor:
                                highlightedIndex === params.index
                                  ? 'lightgray'
                                  : 'white',
                              fontWeight:
                                selectedItem === params.item
                                  ? 'bold'
                                  : 'normal',
                            },
                            ...params,
                          }),
                        inputValue,
                        highlightedIndex,
                        selectedItem,
                        items: transformedItems,
                      })}
                    </div>
                  </DropdownMenu>
                </Dropdown>
              </div>
            )
          }}
        </TDownshift>
      )
    }
  }
}

const Fuck = DropdownMenu as any
const ForwardMenu = React.forwardRef((props, ref) => (
  <Fuck {...props} ref={ref} />
))
