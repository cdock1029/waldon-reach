import React, { Fragment } from 'react'
import * as Yup from 'yup'
import { app, serverTimestamp, newDoc } from '../../lib/firebase'
import {
  Formik,
  Field,
  Form,
  FieldArray,
  FormikProps,
  FormikErrors,
} from 'formik'

type PaymentType = 'PAYMENT' | 'CHARGE'

interface NewTransactionFormProps {
  leaseId: string
  type?: TransactionType
  subType?: TransactionSubType
  amount?: number
  children(
    props: FormikProps<NewTransactionFormState>,
  ): JSX.Element | JSX.Element[] | null
}
interface NewTransactionFormState {
  type: TransactionType
  subType?: TransactionSubType
  date: Date
  leaseId: string
  amount: number
}

const transactionSchema = Yup.object().shape({
  leaseId: Yup.string().required(),
  type: Yup.string().required(),
  subType: Yup.string(),
  date: Yup.date().required(),
  amount: Yup.number()
    .required()
    .min(1 /*this is 1 cent*/, 'Amount must be greater than 0'),
})

export class NewTransactionForm extends React.Component<
  NewTransactionFormProps
> {
  static defaultProps: Pick<NewTransactionFormProps, 'type' | 'amount'> = {
    type: 'PAYMENT',
    amount: 0,
  }
  render() {
    const { children, leaseId, type, subType, amount } = this.props
    return (
      <Formik<NewTransactionFormState>
        validationSchema={transactionSchema}
        initialValues={{
          leaseId,
          type: type!,
          subType,
          date: new Date(),
          amount: amount!,
        }}
        onSubmit={values => {
          alert(JSON.stringify(values, null, 2))
        }}>
        {({ values, ...rest }) => children({ values, ...rest })}
      </Formik>
    )
  }
}
