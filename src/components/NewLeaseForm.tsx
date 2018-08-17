import React, { Fragment } from 'react'
import { Formik, Field, Form, FieldArray, FormikProps } from 'formik'
import Downshift from 'downshift'
import Dinero from 'dinero.js'
import { Collection, Document } from './FirestoreData'
import * as Yup from 'yup'
import { newDoc } from '../lib/firebase'
import { sortUnits } from '../lib'
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
  InputGroup,
  InputGroupAddon,
} from 'reactstrap'
import styled from 'react-emotion'
import { getDownshift } from './DownshiftDropdown'

Dinero.globalLocale = 'en-US'

const PropertyDownshift = getDownshift<Property>()
const TenantDownshift = getDownshift<Tenant>()
const UnitDownshift = getDownshift<Unit>()

const validationSchema = Yup.object().shape({
  propertyId: Yup.string().required(),
  tenantIds: Yup.array()
    .required()
    .min(1)
    .max(1),
  unitIds: Yup.array()
    .required()
    .min(1)
    .max(1),
})

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
        validationSchema={validationSchema}
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
        {({
          values,
          setValues,
          setFieldValue,
          setFieldTouched,
          resetForm,
          isValid,
          touched,
          errors,
          validateForm,
        }: FormikProps<LeaseFormValues>) => {
          const closeModal = () => {
            resetForm()
            this.props.closeModal!()
          }
          const { propertyId } = values
          const authPath = this.props.propertyId
            ? `properties/${propertyId}`
            : 'properties'
          console.log({ values, touched, errors })
          return (
            <Modal isOpen={isModalOpen} toggle={closeModal}>
              <Form>
                <ModalHeader>New Lease</ModalHeader>
                <ModalBody>
                  {isModalOpen ? (
                    <Fragment>
                      <Collection<Property> authPath={authPath}>
                        {(properties, hasLoaded: boolean) => {
                          if (!hasLoaded) {
                            return null
                          }
                          return (
                            <Fragment>
                              {touched.propertyId &&
                                errors.propertyId && (
                                  <FormText color="danger">
                                    {errors.propertyId}
                                  </FormText>
                                )}
                              <PropertyDownshift
                                setFieldTouched={() =>
                                  setFieldTouched('propertyId')
                                }
                                label={<Label>Choose Property</Label>}
                                input={
                                  <Field
                                    name="propertyId"
                                    placeholder="Pick a property"
                                    component={Input}
                                  />
                                }
                                items={properties}
                                downshiftProps={{
                                  onChange: selection => {
                                    // this is right, because "value" only matters
                                    // if we selected an item.. not just "typed"
                                    setFieldValue('propertyId', selection.id)
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
                            </Fragment>
                          )
                        }}
                      </Collection>
                      {propertyId ? (
                        <Collection<Unit>
                          authPath={`properties/${propertyId}/units`}>
                          {(units, hasLoaded: boolean) => {
                            if (!hasLoaded) {
                              return null
                            }
                            let disabled = !units.length
                            return (
                              <Fragment>
                                {touched.unitIds &&
                                  errors.unitIds && (
                                    <FormText color="danger">
                                      {errors.unitIds}
                                    </FormText>
                                  )}
                                <UnitDownshift
                                  setFieldTouched={() =>
                                    setFieldTouched('unitIds')
                                  }
                                  label={<Label>Choose Unit</Label>}
                                  input={
                                    <Input
                                      disabled={disabled}
                                      placeholder={
                                        disabled ? 'No Units' : undefined
                                      }
                                    />
                                  }
                                  items={sortUnits(units)}
                                  downshiftProps={{
                                    onChange: selection => {
                                      setFieldValue(
                                        'unitIds',
                                        values.unitIds.add(selection.id),
                                      )
                                    },
                                    itemToString: u => (u ? u.label : ''),
                                  }}>
                                  {({ getItemProps, items }) => {
                                    return items.map((item, index) => (
                                      <DropdownItem
                                        {...getItemProps!({
                                          key: item.id,
                                          item,
                                          index,
                                        })}>
                                        {item.label}
                                      </DropdownItem>
                                    ))
                                  }}
                                </UnitDownshift>
                              </Fragment>
                            )
                          }}
                        </Collection>
                      ) : null}
                      <Collection<Tenant> authPath="tenants">
                        {(tenants, hasLoaded) => {
                          if (!hasLoaded) {
                            return null
                          }
                          return (
                            <Fragment>
                              {touched.tenantIds &&
                                errors.tenantIds && (
                                  <FormText color="danger">
                                    {errors.tenantIds}
                                  </FormText>
                                )}
                              <TenantDownshift
                                setFieldTouched={() =>
                                  setFieldTouched('tenantIds')
                                }
                                label={<Label>Choose Tenant</Label>}
                                input={<Input />}
                                items={tenants}
                                downshiftProps={{
                                  onChange: selection => {
                                    setFieldValue(
                                      'tenantIds',
                                      values.tenantIds.add(selection.id),
                                    )
                                  },
                                  itemToString: t =>
                                    t ? `${t.firstName} ${t.lastName}` : '',
                                }}>
                                {({ getItemProps, items }) => {
                                  return items.map((item, index) => (
                                    <DropdownItem
                                      {...getItemProps!({
                                        key: item.id,
                                        item,
                                        index,
                                      })}>
                                      {item.firstName} {item.lastName}
                                    </DropdownItem>
                                  ))
                                }}
                              </TenantDownshift>
                            </Fragment>
                          )
                        }}
                      </Collection>
                    </Fragment>
                  ) : null}
                </ModalBody>
                <ModalFooter>
                  <Button onClick={closeModal}>Cancel</Button>
                  <Button disabled={!isValid} color="info" type="submit">
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
