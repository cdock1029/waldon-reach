import React, { Fragment } from 'react'
import { Formik, Field, Form, FormikProps } from 'formik'
import Dinero from 'dinero.js'
import { Collection } from '../../../../App/shared/components/FirestoreData'
import * as Yup from 'yup'
// import { newDoc } from '../lib/firebase'
import { sortUnits, DATE_INPUT_FORMAT } from '../../../../shared/utils'
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
  DropdownMenu as UnmodifiedMenu,
  DropdownItem as UnmodifiedItem,
} from 'reactstrap'
import styled from 'react-emotion'
import {
  toDate,
  format,
  addYears,
  subDays,
  addMonths,
  setDate,
  getDate,
} from 'date-fns'
import { getDownshift } from './DownshiftDropdown'
import { MoneyInput } from './MoneyInput'

Dinero.globalLocale = 'en-US'

const PropertyDownshift = getDownshift<Property>()
const TenantDownshift = getDownshift<Tenant>()
const UnitDownshift = getDownshift<Unit>()

const validationSchema = Yup.object().shape({
  propertyId: Yup.string().required('Property field is required'),
  startDate: Yup.date().required(),
  endDate: Yup.date(),
  rent: Yup.number()
    .required()
    .min(1, 'Must be greater than 0'),
})

declare type MyErrors<Values> = { [K in keyof Values]?: any }

const validateSets = ({ unitIds, tenantIds }: LeaseFormValues) => {
  const errors: MyErrors<LeaseFormValues> = {}

  if (!unitIds.size || unitIds.size > 1) {
    errors.unitIds = 'Unit field is required'
  }
  if (!tenantIds.size || tenantIds.size > 1) {
    errors.tenantIds = 'Tenant field is required'
  }
  return errors
}

const noOp = () => {}
function alertData(data: any) {
  alert(JSON.stringify(data, null, 2))
}

function calculateYearLeaseEndDate(startDate: Date) {
  return subDays(addYears(startDate, 1), 1)
}

interface NewLeaseFormProps {
  isModalOpen?: boolean
  toggleModal?: () => void
  closeModal?: () => void
  propertyId?: string
  unitId?: string
  tenantId?: string
}
interface NewLeaseFormState {
  includeEndDate: boolean
}

interface LeaseFormValues {
  propertyId?: string
  unitIds: Set<string>
  tenantIds: Set<string>
  rent: number
  startDate: Date
  endDate?: Date
}
const initialLeaseFormValues = ({
  propertyId,
  unitId,
  tenantId,
}: NewLeaseFormProps) => {
  let nearestFirstDate = new Date()
  if (getDate(nearestFirstDate) > 1) {
    nearestFirstDate = addMonths(nearestFirstDate, 1)
    nearestFirstDate = setDate(nearestFirstDate, 1)
  }
  const values: LeaseFormValues = {
    propertyId,
    unitIds: new Set<string>(),
    tenantIds: new Set<string>(),
    rent: 0,
    startDate: nearestFirstDate,
    endDate: calculateYearLeaseEndDate(nearestFirstDate),
  }
  if (unitId) {
    values.unitIds.add(unitId)
  }
  if (tenantId) {
    values.tenantIds.add(tenantId)
  }
  return values
}
export class NewLeaseForm extends React.Component<
  NewLeaseFormProps,
  NewLeaseFormState
> {
  initialValues: LeaseFormValues
  constructor(props: NewLeaseFormProps) {
    super(props)
    this.initialValues = initialLeaseFormValues(this.props)
    this.state = {
      includeEndDate: true,
    }
  }
  handleEndDateCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target
    this.setState(() => ({ includeEndDate: checked }))
  }
  render() {
    const { isModalOpen } = this.props
    return (
      <Formik
        enableReinitialize
        initialValues={this.initialValues}
        validate={validateSets}
        validationSchema={validationSchema}
        onSubmit={(
          {
            propertyId,
            unitIds,
            tenantIds,
            rent,
            startDate,
            endDate,
          }: LeaseFormValues,
          { resetForm }: FormikProps<LeaseFormValues>,
        ) => {
          alertData({
            propertyId,
            unitIds: Array.from(unitIds),
            tenantIds: Array.from(tenantIds),
            rent,
            startDate,
            endDate,
          })
          // const result = confirm(
          //   `Confirm New Lease:\n
          //   - Property:\t\t${values.type}
          //   ${values.subType ? `- Sub type:\t${values.subType}` : ''}
          //   - Amount:\t${money}\n
          //   Proceed ?\n`,
          // )

          // if (result) {
          //   const transactionsPath = `leases/${values.leaseId}/transactions`
          //   delete values.leaseId
          //   newDoc(transactionsPath, values)
          //     .then(() => {
          //       alert('Transaction Saved!')
          //     })
          //     .catch(e => alert(`Error: ${e.message}`))
          // }

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
        }: FormikProps<LeaseFormValues>) => {
          const closeModal = () => {
            resetForm()
            this.props.closeModal!()
          }
          const authPath = 'properties'
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
                  {/* <pre>
                    {JSON.stringify(
                      {
                        ...values,
                        unitIds: [...values.unitIds],
                        tenantIds: [...values.tenantIds],
                      },
                      null,
                      2,
                    )}
                  </pre> */}
                  {isModalOpen ? (
                    <Fragment>
                      {touched.propertyId &&
                        errors.propertyId && (
                          <Alert color="danger">{errors.propertyId}</Alert>
                        )}
                      <Collection<Property>
                        authPath={authPath}
                        orderBy={{ field: 'name', direction: 'asc' }}>
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
                              label={<Label>Property</Label>}
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
                                defaultSelectedItem: this.props.propertyId
                                  ? properties.find(
                                      p => p.id === this.props.propertyId,
                                    )
                                  : undefined,
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
                          <Alert color="danger">{errors.unitIds}</Alert>
                        )}
                      {values.propertyId ? (
                        <Collection<Unit>
                          authPath={`properties/${values.propertyId}/units`}>
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
                                label={<Label>Unit</Label>}
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
                                  defaultSelectedItem: this.props.unitId
                                    ? units.find(
                                        u => u.id === this.props.unitId,
                                      )
                                    : undefined,
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
                          <Alert color="danger">{errors.tenantIds}</Alert>
                        )}
                      <Collection<Tenant>
                        authPath="tenants"
                        orderBy={{ field: 'lastName', direction: 'asc' }}>
                        {(tenants, hasLoaded) => {
                          if (!hasLoaded) {
                            return null
                          }
                          return (
                            <TenantDownshift
                              setFieldTouched={() =>
                                setFieldTouched('tenantIds')
                              }
                              label={<Label>Tenant</Label>}
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
                      <FormGroup>
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          name="startDate"
                          value={format(values.startDate, DATE_INPUT_FORMAT)}
                          onBlur={() => setFieldTouched('startDate')}
                          onChange={e => {
                            const { value } = e.target
                            const dateValue = toDate(value)
                            setFieldValue('startDate', dateValue)
                          }}
                        />
                      </FormGroup>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={this.state.includeEndDate}
                            onChange={e => {
                              const { checked } = e.target
                              this.setState(
                                () => ({ includeEndDate: checked }),
                                () => {
                                  const endDateValue = checked
                                    ? calculateYearLeaseEndDate(
                                        values.startDate,
                                      )
                                    : undefined
                                  setFieldValue('endDate', endDateValue)
                                },
                              )
                            }}
                          />{' '}
                          Include End Date
                        </Label>
                      </FormGroup>
                      {this.state.includeEndDate ? (
                        <FormGroup>
                          <Label>End Date</Label>
                          <Input
                            type="date"
                            name="endDate"
                            value={format(values.endDate!, DATE_INPUT_FORMAT)}
                            onBlur={() => setFieldTouched('endDate')}
                            onChange={e => {
                              const { value } = e.target
                              const dateValue = toDate(value)
                              setFieldValue('endDate', dateValue)
                            }}
                          />
                        </FormGroup>
                      ) : null}
                      <MoneyInput
                        onBlur={() => {
                          setFieldTouched('rent')
                        }}
                        onChange={({ total }) => {
                          setFieldValue('rent', total)
                        }}>
                        {({ getWholeInputProps, getFractionInputProps }) => {
                          return (
                            <FormGroup>
                              <Label htmlFor="rent-whole">Rent</Label>
                              {errors.rent &&
                                touched.rent && (
                                  <Alert color="danger">{errors.rent}</Alert>
                                )}
                              <FormGroup css={{ display: 'flex' }}>
                                <Label css={'margin-right: 0.5em;'}>$</Label>
                                <MoneyInput.Whole
                                  {...getWholeInputProps({
                                    id: 'rent-whole',
                                    name: 'rent-whole',
                                  })}
                                />
                                <MoneyInput.Fraction
                                  {...getFractionInputProps({
                                    id: 'rent-fraction',
                                    name: 'rent-fraction',
                                  })}
                                />
                              </FormGroup>
                            </FormGroup>
                          )
                        }}
                      </MoneyInput>
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
