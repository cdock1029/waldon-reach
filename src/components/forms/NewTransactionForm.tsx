import React, { Fragment } from 'react'
import * as Yup from 'yup'
import { newDoc } from '../../lib/firebase'
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
  initialAmount?: number
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
  static defaultProps: Pick<
    NewTransactionFormProps,
    'type' | 'initialAmount'
  > = {
    type: 'PAYMENT',
    initialAmount: 0,
  }
  initialValues: NewTransactionFormState
  constructor(props: NewTransactionFormProps) {
    super(props)
    const { leaseId, type, subType, initialAmount } = props
    this.initialValues = {
      leaseId,
      type: type!,
      date: new Date(),
      amount: initialAmount!,
    }
    if (subType) {
      this.initialValues.subType = subType
    }
  }
  render() {
    const { children } = this.props
    return (
      <Formik<NewTransactionFormState>
        validationSchema={transactionSchema}
        initialValues={this.initialValues}
        onSubmit={async values => {
          // alert(JSON.stringify(values, null, 2))
          const transactionsPath = `leases/${values.leaseId}/transactions`
          delete values.leaseId
          newDoc(transactionsPath, values)
            .then(() => {
              alert('Transaction Saved!')
            })
            .catch(e => alert(`Error: ${e.message}`))
        }}>
        {({ values, ...rest }) => children({ values, ...rest })}
      </Formik>
    )
  }
}
