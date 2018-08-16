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
  DropdownItem,
  DropdownMenu,
  FormGroup,
} from 'reactstrap'

interface Props<T> {
  downshiftProps: Pick<DownshiftProps<T>, 'onChange' | 'itemToString'>
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
          }) => (
            <div>
              <Dropdown isOpen={isOpen} toggle={this.noOp}>
                <DropdownToggle
                  tag="div"
                  data-toggle="dropdown"
                  aria-expanded={isOpen}>
                  <FormGroup>
                    {React.cloneElement(label, { ...getLabelProps() })}
                    {React.cloneElement(input, {
                      ...getInputProps({
                        onFocus: () => openMenu(),
                        onBlur: () => closeMenu(),
                      }),
                    })}
                  </FormGroup>
                </DropdownToggle>
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
                  </div>
                </DropdownMenu>
              </Dropdown>
            </div>
          )}
        </TDownshift>
      )
    }
  }
}
