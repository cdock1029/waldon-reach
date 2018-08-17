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
} from 'reactstrap'

interface Props<T> {
  setFieldTouched(): void
  downshiftProps: Pick<
    DownshiftProps<T>,
    'onChange' | 'itemToString' | 'onInputValueChange'
  >
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
}

export function getDownshift<T>(): ComponentClass<Props<T>> {
  const TDownshift: DownshiftInterface<T> = Downshift

  return class DownshiftDropdown extends React.Component<Props<T>> {
    static defaultProps: Pick<Props<T>, 'itemsTransform'> = {
      itemsTransform: (items, { inputValue, itemToString }) => {
        return items.filter(
          item =>
            !inputValue ||
            itemToString!(item)
              .toUpperCase()
              .includes(inputValue.toUpperCase()),
        )
      },
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
                        {React.cloneElement(input, {
                          ...getInputProps({
                            onFocus: () => {
                              openMenu()
                            },
                            onBlur: () => {
                              // validate()
                              setFieldTouched()
                              closeMenu()
                            },
                          }),
                        })}
                        <InputGroupAddon addonType="append">
                          <Button>Add New</Button>
                        </InputGroupAddon>
                      </InputGroup>
                    </FormGroup>
                  </DropdownToggle>
                  {/* <DropdownMenu
                  tag={TagWithRef}
                  {...getMenuProps({ refKey: 'innerRef' })}
                  css={{
                    maxHeight: '20em',
                    overflowY: 'scroll',
                  }}>
                  {children({
                    getItemProps: params =>
                      getItemProps({
                        style: {
                          backgroundColor:
                            highlightedIndex === params.index
                              ? 'lightgray'
                              : 'white',
                          fontWeight:
                            selectedItem === params.item ? 'bold' : 'normal',
                        },
                        ...params,
                      }),
                    inputValue,
                    highlightedIndex,
                    selectedItem,
                    items: itemsTransform!(items, {
                      itemToString,
                      inputValue,
                    }),
                  })}
                </DropdownMenu> */}
                  <DropdownMenu
                    css={{
                      maxHeight: '20em',
                      overflowY: 'scroll',
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
