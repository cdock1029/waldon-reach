import React, { Fragment } from 'react'
import { Form, FormGroup, Label, Alert, Button, Input } from 'reactstrap'
import { MoneyInput } from '../MoneyInput'
import { NewTransactionForm } from './NewTransactionForm'
import styled from 'react-emotion'
import { toDate, format } from 'date-fns'
import { DATE_INPUT_FORMAT } from '../../../../../shared/utils'

interface PaymentFormProps {
  lease: Lease
}

const StyledPaymentFormComponent = styled(Form)`
  background-color: #ddffdd;
  padding: 1em;
  .money {
    display: flex;
  }
`

export class PaymentForm extends React.Component<PaymentFormProps> {
  render() {
    const { lease } = this.props
    return (
      <NewTransactionForm
        leaseId={lease.id}
        // todo fix this name.. to default or re-think
        initialAmount={lease.balance > 0 ? lease.balance : undefined}>
        {({
          values,
          setFieldValue,
          setFieldTouched,
          handleSubmit,
          errors,
          touched,
        }) => {
          return (
            <StyledPaymentFormComponent
              onSubmit={handleSubmit}
              className="payment-container">
              <FormGroup>
                <Label css={'font-weight: bold;'}>Payment</Label>
              </FormGroup>
              <FormGroup>
                <Label>Payment Date</Label>
                <Input
                  type="date"
                  value={format(values.date, DATE_INPUT_FORMAT)}
                  onChange={e => {
                    const { value } = e.target
                    setFieldValue('date', toDate(value))
                  }}
                  onBlur={e => setFieldTouched('date')}
                />
              </FormGroup>
              <MoneyInput
                defaultValue={lease.balance > 0 ? lease.balance : undefined}
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
                <Button size="sm" type="submit" color="secondary">
                  Submit
                </Button>
              </FormGroup>
            </StyledPaymentFormComponent>
          )
        }}
      </NewTransactionForm>
    )
  }
}
