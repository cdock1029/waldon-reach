import React, { Fragment } from 'react'
import { Formik, Field, Form, FieldArray, FormikBag } from 'formik'
import Downshift from 'downshift'
import Dinero from 'dinero.js'
import { Collection } from './FirestoreData'
import Yup from 'yup'
import { newDoc } from '../lib/firebase'
import {
  Alert,
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

const toggleNoop = () => {}

interface NewLeaseFormProps {
  isModalOpen?: boolean
  toggleModal?: () => void
  closeModal?: () => void
  propertyId?: string
  unitId?: string
  tenantId?: string
}

interface LeaseFormValues {
  propertyId?: string
  unitIds: Set<string>
  tenantIds: Set<string>
}
const initialLeaseFormValues: LeaseFormValues = {
  propertyId: undefined,
  unitIds: new Set<string>(),
  tenantIds: new Set<string>(),
}
export class NewLeaseForm extends React.Component<NewLeaseFormProps> {
  render() {
    const { propertyId, unitId, tenantId, isModalOpen } = this.props
    const price = Dinero({ amount: 55000 })
      .add(Dinero({ amount: 34 }))
      .toFormat('$0,0.00')
    return (
      <Formik
        initialValues={initialLeaseFormValues}
        onSubmit={(values: LeaseFormValues) => alert('todo')}>
        {({ values, setValues, resetForm }) => {
          const closeModal = () => {
            resetForm()
            this.props.closeModal!()
          }
          const { propertyId } = values
          return (
            <Modal isOpen={isModalOpen} centered toggle={closeModal}>
              <ModalHeader>New Lease</ModalHeader>
              <ModalBody>
                {isModalOpen ? (
                  <Form>
                    <Collection<Property> authPath="properties">
                      {(properties, hasLoaded) => (
                        <Fragment>
                          <Downshift
                            itemToString={(p: Property) => (p ? p.name : '')}
                            onChange={(selection: Property) => {
                              setValues({ ...values, propertyId: selection.id })
                            }}>
                            {({
                              getMenuProps,
                              getRootProps,
                              toggleMenu,
                              getInputProps,
                              getItemProps,
                              getLabelProps,
                              openMenu,
                              closeMenu,
                              isOpen,
                              inputValue,
                              highlightedIndex,
                              selectedItem,
                            }) => {
                              console.log({ ...values })
                              return (
                                <div>
                                  <Dropdown isOpen={isOpen} toggle={toggleNoop}>
                                    <DropdownToggle
                                      tag="div"
                                      data-toggle="dropdown"
                                      aria-expanded={isOpen}>
                                      <FormGroup>
                                        <Label {...getLabelProps()}>
                                          Enter a Property
                                        </Label>
                                        <Input
                                          {...getInputProps({
                                            onFocus: () => openMenu(),
                                            onBlur: () => closeMenu(),
                                            onChange: () => {
                                              if (values.propertyId) {
                                                console.log('resetting!')
                                                resetForm()
                                              }
                                            },
                                          })}
                                        />
                                      </FormGroup>
                                    </DropdownToggle>
                                    <DropdownMenu>
                                      {properties
                                        .filter(
                                          property =>
                                            !inputValue ||
                                            property.name
                                              .toUpperCase()
                                              .includes(
                                                inputValue.toUpperCase(),
                                              ),
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
                              )
                            }}
                          </Downshift>
                          {propertyId ? (
                            <Collection<Unit>
                              key={propertyId}
                              authPath={`properties/${propertyId}/units`}>
                              {(units, hasLoaded) => (
                                <Downshift
                                  onChange={(selection: Unit) => {
                                    setValues({
                                      ...values,
                                      unitIds: values.unitIds.add(selection.id),
                                    })
                                  }}
                                  itemToString={(u: Unit) =>
                                    u ? u.label : ''
                                  }>
                                  {({
                                    getInputProps,
                                    getItemProps,
                                    getLabelProps,
                                    openMenu,
                                    closeMenu,
                                    isOpen,
                                    inputValue,
                                    highlightedIndex,
                                    selectedItem,
                                  }) => (
                                    <div>
                                      <Dropdown
                                        isOpen={isOpen}
                                        toggle={toggleNoop}>
                                        <DropdownToggle
                                          tag="div"
                                          data-toggle="dropdown"
                                          aria-expanded={isOpen}>
                                          <FormGroup>
                                            <Label {...getLabelProps()}>
                                              Enter a Unit
                                            </Label>
                                            <Input
                                              {...getInputProps({
                                                onFocus: () => openMenu(),
                                                onBlur: () => closeMenu(),
                                              })}
                                            />
                                          </FormGroup>
                                        </DropdownToggle>
                                        <DropdownMenu>
                                          {units
                                            .filter(
                                              unit =>
                                                !inputValue ||
                                                unit.label
                                                  .toUpperCase()
                                                  .includes(
                                                    inputValue.toUpperCase(),
                                                  ),
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
                                                {item.label}
                                              </DropdownItem>
                                            ))}
                                        </DropdownMenu>
                                      </Dropdown>
                                    </div>
                                  )}
                                </Downshift>
                              )}
                            </Collection>
                          ) : null}
                        </Fragment>
                      )}
                    </Collection>
                  </Form>
                ) : null}
              </ModalBody>
              <ModalFooter>
                <Button onClick={closeModal}>Cancel</Button>
                <Button color="info">Create Lease</Button>
              </ModalFooter>
            </Modal>
          )
        }}
      </Formik>
    )
  }
}

export default NewLeaseForm
