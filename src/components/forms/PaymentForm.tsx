import React, { Fragment } from 'react'
import { Form, FormGroup, Label, Alert, Button } from 'reactstrap'
import { MoneyInput } from '../MoneyInput'
import { NewTransactionForm } from './NewTransactionForm'

interface PaymentFormProps {
  lease: Lease
}

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
            <Form onSubmit={handleSubmit} className="payment-container">
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
                      <FormGroup
                        css={'display: flex; justify-content: space-between'}>
                        <Label
                          css={'font-weight: bold;'}
                          htmlFor="payment-whole">
                          Payment
                        </Label>
                      </FormGroup>
                      <FormGroup className="money">
                        <Label>Amount $</Label>
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
                          <Button
                            tabIndex={-1}
                            outline
                            onClick={clear}
                            size="sm">
                            x
                          </Button>
                        </div>
                      </FormGroup>
                    </Fragment>
                  )
                }}
              </MoneyInput>
              <FormGroup>
                <Button type="submit" color="success">
                  Submit
                </Button>
              </FormGroup>
            </Form>
          )
        }}
      </NewTransactionForm>
    )
  }
}
