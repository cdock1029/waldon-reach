import React from 'react'
import { Formik } from 'formik'
import Downshift from 'downshift'
import Dinero from 'dinero.js'
import { Collection } from './FirestoreData'
import Yup from 'yup'
import { newDoc } from '../lib/firebase'
import {
  Alert,
  Form,
  FormGroup,
  Label,
  Input,
  FormText,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap'
Dinero.globalLocale = 'en-US'

interface NewLeaseFormProps {
  isModalOpen?: boolean
  toggleModal?: () => void
  propertyId?: string
  unitId?: string
  tenantId?: string
}

export class NewLeaseForm extends React.Component<NewLeaseFormProps> {
  render() {
    const {
      propertyId,
      unitId,
      tenantId,
      isModalOpen,
      toggleModal,
    } = this.props
    const price = Dinero({ amount: 55000 })
      .add(Dinero({ amount: 34 }))
      .toFormat('$0,0.00')
    return (
      <Formik
        initialValues={{
          propertyIds: [],
          unitsIds: [],
          tenantIds: [],
        }}
        onSubmit={() => alert('todo')}>
        {() => (
          <Modal isOpen={isModalOpen} centered toggle={toggleModal}>
            <ModalHeader>New Lease</ModalHeader>
            <ModalBody>
              {isModalOpen ? (
                <Downshift
                  onChange={selection => console.log({ selection })}
                  itemToString={property => (property ? property.name : '')}>
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
                  }) => {
                    return (
                      <div>
                        <Collection<Property>
                          authPath="properties"
                          render={(properties, hasLoaded) => (
                            <div>
                              <label {...getLabelProps()}>
                                Enter a Property
                              </label>
                              <input
                                {...getInputProps({
                                  onFocus: () => openMenu(),
                                  onBlur: () => closeMenu(),
                                })}
                              />
                              <Dropdown isOpen={isOpen} toggle={() => {}}>
                                <DropdownToggle tag="div" />
                                <DropdownMenu>
                                  {properties
                                    .filter(
                                      property =>
                                        !inputValue ||
                                        property.name
                                          .toUpperCase()
                                          .includes(inputValue.toUpperCase()),
                                    )
                                    .map((item, index) => (
                                      <DropdownItem
                                        {...getItemProps({
                                          key: item.id,
                                          index,
                                          item,
                                          style: {
                                            backgroundColor:
                                              highlightedIndex === index
                                                ? 'lightgray'
                                                : 'white',
                                            fontWeight:
                                              selectedItem === item
                                                ? 'bold'
                                                : 'normal',
                                          },
                                        })}>
                                        {item.name}
                                      </DropdownItem>
                                    ))}
                                </DropdownMenu>
                              </Dropdown>
                            </div>
                          )}
                        />
                      </div>
                    )
                  }}
                </Downshift>
              ) : null}
            </ModalBody>
            <ModalFooter>
              <Button
                onClick={() => {
                  toggleModal!()
                }}>
                Cancel
              </Button>
              <Button color="info">Create Lease</Button>
            </ModalFooter>
          </Modal>
        )}
      </Formik>
    )
  }
}

export default NewLeaseForm
