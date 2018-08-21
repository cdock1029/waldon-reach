import React, { Fragment } from 'react'
import * as Yup from 'yup'
import {
  Formik,
  Field,
  Form,
  FieldArray,
  FormikProps,
  FormikErrors,
} from 'formik'

interface NewTransactionFormProps {
  children(props: any): JSX.Element | JSX.Element[] | null
}
interface NewTransactionFormState {
  leaseId?: string
  type: string
  subType?: string
  amount: number
}

const transactionSchema = Yup.object().shape({
  leaseId: Yup.string().required(),
  type: Yup.string().required(),
  subType: Yup.string(),
  amount: Yup.number()
    .required()
    .min(1 /*this is 1 cent*/, 'Amount must be greater than 0'),
})

export class NewTransactionForm extends React.Component {
  render() {
    const { children } = this.props
    return (
      <div>
        <h3>todo</h3>
      </div>
    )
  }
}
