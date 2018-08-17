import React, { Fragment } from 'react'
import {
  Formik,
  Field,
  Form,
  FieldArray,
  FormikProps,
  FormikErrors,
} from 'formik'
import Dinero from 'dinero.js'
import { Collection, Document } from './FirestoreData'
import * as Yup from 'yup'
import { newDoc } from '../lib/firebase'
import { sortUnits } from '../lib'
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
  rent: Yup.number()
    .required()
    .min(1, 'Must be greater than 0'),
})

declare type MyErrors<Values> = { [K in keyof Values]?: any }

const validateSets = ({ unitIds, tenantIds }: LeaseFormValues) => {
  const errors: MyErrors<LeaseFormValues> = {}

  if (!unitIds.size || unitIds.size > 1) {
    errors.unitIds = 'Must choose 1 Unit'
  }
  if (!tenantIds.size || tenantIds.size > 1) {
    errors.tenantIds = 'Must choose 1 Tenant'
  }
  return errors
}

const noOp = () => {}
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
  rent: number
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
    rent: 0,
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
        validate={validateSets}
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
            <Modal
              isOpen={isModalOpen}
              toggle={noOp}
              backdrop="static"
              size="lg">
              <Form>
                <ModalHeader>New Lease</ModalHeader>
                <ModalBody>
                  <pre>
                    {JSON.stringify(
                      {
                        ...values,
                        unitIds: [...values.unitIds],
                        tenantIds: [...values.tenantIds],
                        rent: Dinero({ amount: values.rent * 100 }).toFormat(
                          '$0,0.00',
                        ),
                      },
                      null,
                      2,
                    )}
                  </pre>
                  {isModalOpen ? (
                    <Fragment>
                      {touched.propertyId &&
                        errors.propertyId && (
                          <FormText color="danger">
                            {errors.propertyId}
                          </FormText>
                        )}
                      <Collection<Property> authPath={authPath}>
                        {(properties, hasLoaded: boolean) => {
                          if (!hasLoaded) {
                            return null
                          }
                          return (
                            <PropertyDownshift
                              focusOnMount
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
                                // "value" only matters
                                // if we selected an item.. not just "typed"
                                onChange: selection => {
                                  // unit is dependent on property, so alway reset
                                  setValues({
                                    ...values,
                                    propertyId: selection.id,
                                    unitIds: new Set<string>(),
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
                        }}
                      </Collection>
                      {touched.unitIds &&
                        errors.unitIds && (
                          <FormText color="danger">{errors.unitIds}</FormText>
                        )}
                      {propertyId ? (
                        <Collection<Unit>
                          authPath={`properties/${propertyId}/units`}>
                          {(units, hasLoaded: boolean) => {
                            if (!hasLoaded) {
                              return null
                            }
                            let disabled = !units.length
                            return (
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
                                      // TODO: add instead of replace when
                                      // accepting multiple units later..
                                      new Set([selection.id]),
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
                            )
                          }}
                        </Collection>
                      ) : null}
                      {touched.tenantIds &&
                        errors.tenantIds && (
                          <FormText color="danger">{errors.tenantIds}</FormText>
                        )}
                      <Collection<Tenant> authPath="tenants">
                        {(tenants, hasLoaded) => {
                          if (!hasLoaded) {
                            return null
                          }
                          return (
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
                                    new Set([selection.id]),
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
                          )
                        }}
                      </Collection>
                      <MyInput
                        name="rent"
                        label="Rent"
                        type="number"
                        min="0"
                        step="0.01"
                        // onChange={(e: any) =>
                        //   console.log(typeof e.target.value)
                        // }
                      />
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

const MyInput = ({
  name,
  label,
  ...rest
}: {
  name: string
  label: string
  [key: string]: any
}) => {
  return (
    <Field
      name={name}
      {...rest}
      render={({ field, form }: any) => (
        <FormGroup>
          {form.errors[name] &&
            form.touched[name] && (
              <FormText color="danger">{form.errors[name]}</FormText>
            )}
          <Label for={name}>{label}</Label>
          <Input {...field} />
        </FormGroup>
      )}
    />
  )
}

export default NewLeaseForm
