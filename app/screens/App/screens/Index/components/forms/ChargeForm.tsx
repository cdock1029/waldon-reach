import React, { Fragment } from 'react'
import { Form, FormGroup, Label, Alert, Button, Input } from 'reactstrap'
import { MoneyInput } from '../MoneyInput'
import { NewTransactionForm } from './NewTransactionForm'
import styled from 'react-emotion'

enum ChargeTypes {
  LATE_FEE = 'LATE_FEE',
  RENT = 'RENT',
}

interface ChargeFormProps {
  lease: Lease
}

const StyledChargeFormComponent = styled(Form)`
  background-color: #ffeeee;
  padding: 1em;
  .money {
    display: flex;
  }
`
const InlineFormGroup = styled(FormGroup)`
  display: flex;
  justify-content: space-between;
`

const DUMMY_LATE_FEE = 3000

export class ChargeForm extends React.Component<ChargeFormProps> {
  render() {
    const { lease } = this.props
    return (
      <NewTransactionForm
        type="CHARGE"
        subType="LATE_FEE"
        leaseId={lease.id}
        initialAmount={DUMMY_LATE_FEE}>
        {({
          setFieldValue,
          setFieldTouched,
          handleSubmit,
          errors,
          touched,
          values,
        }) => {
          return (
            <StyledChargeFormComponent
              onSubmit={handleSubmit}
              className="payment-container">
              <FormGroup>
                <Label css={'font-weight: bold;'}>Charge</Label>
              </FormGroup>
              <FormGroup>
                <Label for="subType">Type</Label>
                <Input
                  type="select"
                  value={values.subType}
                  name="subType"
                  id="subType"
                  onChange={e => setFieldValue('subType', e.target.value)}>
                  <option value={ChargeTypes.LATE_FEE}>Late Fee</option>
                  <option value={ChargeTypes.RENT}>Rent</option>
                </Input>
              </FormGroup>
              <MoneyInput
                defaultValue={DUMMY_LATE_FEE}
                onBlur={e => setFieldTouched('amount')}
                onChange={({ total }) => {
                  setFieldValue('amount', total)
                }}>
                {({ getWholeInputProps, getFractionInputProps, clear }) => {
                  return (
                    <Fragment>
                      {errors.amount &&
                        touched.amount && (
                          <Alert color="danger">{errors.amount}</Alert>
                        )}
                      <FormGroup>
                        <Label>Amount</Label>
                        <div className="money">
                          <Label>$</Label>
                          <MoneyInput.Whole
                            {...getWholeInputProps({
                              id: 'payment-whole',
                              name: 'payment-whole',
                            })}
                          />
                          <MoneyInput.Fraction
                            {...getFractionInputProps({
                              id: 'payment-fraction',
                              name: 'payment-fraction',
                            })}
                          />
                          <div css={'margin-left: 0.5em;'}>
                            <button
                              css={`
                                border: none;
                                background: white;
                                border-radius: 4px;
                                text-transform: none !important;
                                padding: 2px 6px;
                              `}
                              tabIndex={-1}
                              onClick={clear}>
                              x
                            </button>
                          </div>
                        </div>
                      </FormGroup>
                    </Fragment>
                  )
                }}
              </MoneyInput>
              <FormGroup>
                <Button type="submit" size="sm" color="secondary">
                  Submit
                </Button>
              </FormGroup>
            </StyledChargeFormComponent>
          )
        }}
      </NewTransactionForm>
    )
  }
}