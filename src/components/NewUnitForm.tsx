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
    const initial: Pick<Unit, 'label'> = { label: '' }
    return (
      <Formik
        initialValues={initial}
        validationSchema={unitValidationSchema}
        onSubmit={(values, { setErrors, setSubmitting, resetForm }) => {
          const { propertyId } = this.props
          const upperCased = { label: values.label.toUpperCase() }
          newDoc(`properties/${propertyId}/units`, upperCased)
            .then(() => {
              // setSubmitting(false)
              toggleModal()
              resetForm()
            })
            .catch((e: Error) => {
              setSubmitting(false)
              setErrors({ label: e.message })
            })
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
                    <Label for="label">Unit Address/Label</Label>
                    <Input
                      type="text"
                      name="label"
                      id="label"
                      value={values.label}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {touched.label &&
                      errors.label && (
                        <FormText color="danger">{errors.label}</FormText>
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
