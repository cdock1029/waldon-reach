import React from 'react'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { newDoc, auth } from '../lib/firebase'
import {
  Form,
  FormGroup,
  Label,
  Input,
  FormText,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from 'reactstrap'
import { css } from 'react-emotion'

interface Props {
  propertyId: string
  isModalOpen: boolean
  toggleModal: () => void
}

const unitValidationSchema = Yup.object().shape({
  label: Yup.string()
    .required()
    .min(1)
    .max(200),
})
class NewUnitForm extends React.Component<Props> {
  render() {
    const { isModalOpen, toggleModal } = this.props
    const activeCompany = auth.activeCompany
    return (
      <Formik
        initialValues={{
          address: '',
        }}
        onSubmit={({ address }, { setErrors, setSubmitting, resetForm }) => {
          const { propertyId } = this.props
          newDoc(`companies/${activeCompany}/properties/${propertyId}/units`, {
            address,
          })
            .then(() => {
              // setSubmitting(false)
              toggleModal()
              resetForm()
            })
            .catch((e: Error) => {
              setSubmitting(false)
              setErrors({ address: e.message })
            })
        }}
        validate={({ address }) => {
          const errors: { address?: string } = {}
          if (!address) {
            errors.address = 'Required'
          }
          return errors
        }}
        render={({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          submitForm,
          resetForm,
        }) => {
          return (
            <Modal centered isOpen={isModalOpen} toggle={toggleModal}>
              <ModalHeader
                className={css({ flexDirection: 'row' })}
                toggle={toggleModal}>
                New Unit
              </ModalHeader>
              <ModalBody>
                <Form onSubmit={handleSubmit}>
                  <FormGroup>
                    <Label for="address">Unit Address</Label>
                    <Input
                      type="text"
                      name="address"
                      id="address"
                      value={values.address}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {touched.address &&
                      errors.address && (
                        <FormText color="danger">{errors.address}</FormText>
                      )}
                  </FormGroup>
                </Form>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="secondary"
                  onClick={() => {
                    toggleModal()
                    resetForm()
                  }}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onClick={submitForm}
                  disabled={isSubmitting}>
                  Save
                </Button>
              </ModalFooter>
            </Modal>
          )
        }}
      />
    )
  }
}

export default NewUnitForm
