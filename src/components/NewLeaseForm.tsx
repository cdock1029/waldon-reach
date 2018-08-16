import React, { Fragment } from 'react'
import { Formik, Field, Form, FieldArray, FormikProps } from 'formik'
import Downshift from 'downshift'
import Dinero from 'dinero.js'
import { Collection, Document } from './FirestoreData'
import Yup from 'yup'
import { newDoc } from '../lib/firebase'
import { BooleanValue } from 'react-values'
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
  DropdownMenu as UnmodifiedMenu,
  DropdownItem as UnmodifiedItem,
} from 'reactstrap'
import styled from 'react-emotion'
import { getDownshift } from './DownshiftDropdown'

Dinero.globalLocale = 'en-US'

const PropertyDownshift = getDownshift<Property>()

// const price = Dinero({ amount: 55000 })
//   .add(Dinero({ amount: 34 }))
//   .toFormat('$0,0.00')

const toggleNoop = () => {}
function alertData(data: any) {
  alert(JSON.stringify(data, null, 2))
}

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
const initialLeaseFormValues = ({
  propertyId,
  unitId,
  tenantId,
}: NewLeaseFormProps) => {
  const values: LeaseFormValues = {
    propertyId,
    unitIds: new Set<string>(),
    tenantIds: new Set<string>(),
  }
  if (unitId) {
    values.unitIds.add(unitId)
  }
  if (tenantId) {
    values.tenantIds.add(tenantId)
  }
  return values
}
export class NewLeaseForm extends React.Component<NewLeaseFormProps> {
  render() {
    const { isModalOpen } = this.props
    const initialValues = initialLeaseFormValues(this.props)
    return (
      <Formik
        enableReinitialize
        initialValues={initialValues}
        onSubmit={(
          { propertyId, unitIds, tenantIds }: LeaseFormValues,
          { resetForm }: FormikProps<LeaseFormValues>,
        ) => {
          alertData({
            propertyId,
            unitIds: Array.from(unitIds),
            tenantIds: Array.from(tenantIds),
          })
          resetForm()
          this.props.closeModal!()
        }}>
        {({ values, setValues, resetForm }: FormikProps<LeaseFormValues>) => {
          const closeModal = () => {
            resetForm()
            this.props.closeModal!()
          }
          const { propertyId } = values
          const authPath = this.props.propertyId
            ? `properties/${propertyId}`
            : 'properties'
          return (
            <Modal isOpen={isModalOpen} toggle={closeModal}>
              <Form>
                <ModalHeader>New Lease</ModalHeader>
                <ModalBody>
                  {isModalOpen ? (
                    <Collection<Property> authPath={authPath}>
                      {(properties, hasLoaded: boolean) => {
                        if (!hasLoaded) {
                          return null
                        }
                        return (
                          <PropertyDownshift
                            label={<Label>Choose Property</Label>}
                            input={<Input />}
                            items={properties}
                            downshiftProps={{
                              onChange: selection => {
                                setValues({
                                  ...values,
                                  propertyId: selection.id,
                                })
                              },
                              itemToString: p => (p ? p.name : ''),
                            }}>
                            {({ getItemProps, items }) => {
                              return items.map((item, index) => (
                                <DropdownItem
                                  {...getItemProps!({
                                    key: item.id,
                                    item,
                                    index,
                                  })}>
                                  {item.name}
                                </DropdownItem>
                              ))
                            }}
                          </PropertyDownshift>
                        )
                        //           {propertyId ? (
                        //             <h3>todo</h3>
                        //           ) : (
                        //             <Collection<Unit>
                        //               key={propertyId}
                        //               authPath={`properties/${propertyId}/units`}>
                        //               {(units, hasLoaded) => (
                        //                 <Downshift
                        //                   onChange={(selection: Unit) => {
                        //                     setValues({
                        //                       ...values,
                        //                       unitIds: values.unitIds.add(
                        //                         selection.id,
                        //                       ),
                        //                     })
                        //                   }}
                        //                   itemToString={(u: Unit) =>
                        //                     u ? u.label : ''
                        //                   }>
                        //                   {({
                        //                     getInputProps,
                        //                     getItemProps,
                        //                     getLabelProps,
                        //                     openMenu,
                        //                     closeMenu,
                        //                     isOpen,
                        //                     inputValue,
                        //                     highlightedIndex,
                        //                     selectedItem,
                        //                   }) => (
                        //                     <div>
                        //                       <Dropdown
                        //                         isOpen={isOpen}
                        //                         toggle={toggleNoop}>
                        //                         <DropdownToggle
                        //                           tag="div"
                        //                           data-toggle="dropdown"
                        //                           aria-expanded={isOpen}>
                        //                           <FormGroup>
                        //                             <Label {...getLabelProps()}>
                        //                               Enter a Unit
                        //                             </Label>
                        //                             <Input
                        //                               {...getInputProps({
                        //                                 onFocus: () => openMenu(),
                        //                                 onBlur: () => closeMenu(),
                        //                               })}
                        //                             />
                        //                           </FormGroup>
                        //                         </DropdownToggle>
                        //                         <DropdownMenu
                        //                           css={{
                        //                             maxHeight: '10em',
                        //                             overflowY: 'scroll',
                        //                           }}>
                        //                           {units
                        //                             .filter(
                        //                               unit =>
                        //                                 !inputValue ||
                        //                                 unit.label
                        //                                   .toUpperCase()
                        //                                   .includes(
                        //                                     inputValue.toUpperCase(),
                        //                                   ),
                        //                             )
                        //                             .map((item, index) => (
                        //                               <DropdownItem
                        //                                 {...getItemProps({
                        //                                   key: item.id,
                        //                                   index,
                        //                                   item,
                        //                                   style: {
                        //                                     backgroundColor:
                        //                                       highlightedIndex ===
                        //                                       index
                        //                                         ? 'lightgray'
                        //                                         : 'white',
                        //                                     fontWeight:
                        //                                       selectedItem === item
                        //                                         ? 'bold'
                        //                                         : 'normal',
                        //                                   },
                        //                                 })}>
                        //                                 {item.label}
                        //                               </DropdownItem>
                        //                             ))}
                        //                         </DropdownMenu>
                        //                       </Dropdown>
                        //                     </div>
                        //                   )}
                        //                 </Downshift>
                        //               )}
                        //             </Collection>
                        //           )}
                        //         </Fragment>
                        //       )
                        //     }}
                        //   </Comp>
                        // ) : null}
                        // <Collection<Tenant> authPath="tenants">
                        //   {(tenants, hasLoaded) => {
                        //     return (
                        //       <h2>todo</h2>
                        // <Downshift
                        //   onChange={(selection: Tenant) => {
                        //     setValues({
                        //       ...values,
                        //       tenantIds: values.tenantIds.add(selection.id),
                        //     })
                        //   }}
                        //   itemToString={(t: Tenant) =>
                        //     t ? `${t.lastName}, ${t.firstName}` : ''
                        //   }>
                        //   {({
                        //     getInputProps,
                        //     getItemProps,
                        //     getLabelProps,
                        //     openMenu,
                        //     closeMenu,
                        //     isOpen,
                        //     inputValue,
                        //     highlightedIndex,
                        //     selectedItem,
                        //   }) => (
                        //     <div>
                        //       <Dropdown isOpen={isOpen} toggle={toggleNoop}>
                        //         <DropdownToggle
                        //           tag="div"
                        //           data-toggle="dropdown"
                        //           aria-expanded={isOpen}>
                        //           <FormGroup>
                        //             <Label {...getLabelProps()}>
                        //               Enter a Tenant
                        //             </Label>
                        //             <Input
                        //               {...getInputProps({
                        //                 onFocus: () => openMenu(),
                        //                 onBlur: () => closeMenu(),
                        //               })}
                        //             />
                        //           </FormGroup>
                        //         </DropdownToggle>
                        //         <DropdownMenu>
                        //           {tenants
                        //             .filter(tenant => {
                        //               const inValUpper = inputValue
                        //                 ? inputValue.toUpperCase()
                        //                 : ''
                        //               return (
                        //                 !inValUpper ||
                        //                 tenant.firstName
                        //                   .toUpperCase()
                        //                   .includes(inValUpper) ||
                        //                 tenant.lastName
                        //                   .toUpperCase()
                        //                   .includes(inValUpper)
                        //               )
                        //             })
                        //             .map((item, index) => (
                        //               <DropdownItem
                        //                 {...getItemProps({
                        //                   key: item.id,
                        //                   index,
                        //                   item,
                        //                   style: {
                        //                     backgroundColor:
                        //                       highlightedIndex === index
                        //                         ? 'lightgray'
                        //                         : 'white',
                        //                     fontWeight:
                        //                       selectedItem === item
                        //                         ? 'bold'
                        //                         : 'normal',
                        //                   },
                        //                 })}>
                        //                 {`${item.lastName}, ${item.firstName}`}
                        //               </DropdownItem>
                        //             ))}
                        //         </DropdownMenu>
                        //       </Dropdown>
                        //     </div>
                        //   )}
                        // </Downshift>
                        //)
                      }}
                    </Collection>
                  ) : null}
                </ModalBody>
                <ModalFooter>
                  <Button onClick={closeModal}>Cancel</Button>
                  <Button color="info" type="submit">
                    Create Lease
                  </Button>
                </ModalFooter>
              </Form>
            </Modal>
          )
        }}
      </Formik>
    )
  }
}

const DropdownItem = styled(UnmodifiedItem)`
  white-space: normal;
`
const DropdownMenu = styled(UnmodifiedMenu)`
  max-height: 18em;
  overflow-y: scroll;
  width: 100%;
`

export default NewLeaseForm
