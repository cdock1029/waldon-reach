import React, { Fragment } from 'react'
import { Form, FormGroup, Label, Alert, Button } from 'reactstrap'
import { MoneyInput } from '../MoneyInput'
import { NewTransactionForm } from './NewTransactionForm'

interface ChargeFormProps {
  lease: Lease
}

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
        }) => {
          return (
            <Form onSubmit={handleSubmit} className="payment-container">
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
                      <FormGroup
                        css={'display: flex; justify-content: space-between'}>
                        <Label htmlFor="payment-whole">Charge</Label>
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
                <Button type="submit" color="danger">
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
