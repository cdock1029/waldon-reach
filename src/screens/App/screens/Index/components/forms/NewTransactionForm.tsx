import React, { Fragment } from 'react'
import * as Yup from 'yup'
import { newDoc } from '../../../../../../shared/firebase'
import {
  Formik,
  Field,
  Form,
  FieldArray,
  FormikProps,
  FormikErrors,
} from 'formik'
import Dinero from 'dinero.js'
import { format } from 'date-fns'
import { DATE_DISPLAY_FORMAT } from '../../../../../shared/utils'

class FormikNewTransaction extends Formik<NewTransactionFormState> {}

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
      <FormikNewTransaction
        validationSchema={transactionSchema}
        initialValues={this.initialValues}
        onSubmit={async values => {
          const money = Dinero({ amount: values.amount }).toFormat('$0,0.00')
          const result = confirm(
            `Confirm Transaction:\n
            - Type:\t\t${values.type}
            ${values.subType ? `- Sub type:\t${values.subType}` : ''}
            - Date:\t${format(values.date, DATE_DISPLAY_FORMAT)}\n
            - Amount:\t${money}\n
            Proceed ?\n`,
          )

          if (result) {
            const transactionsPath = `leases/${values.leaseId}/transactions`
            delete values.leaseId
            newDoc(transactionsPath, values)
              .then(() => {
                alert('Transaction Saved!')
              })
              .catch(e => alert(`Error: ${e.message}`))
          }
        }}>
        {({ values, ...rest }) => children({ values, ...rest })}
      </FormikNewTransaction>
    )
  }
}
