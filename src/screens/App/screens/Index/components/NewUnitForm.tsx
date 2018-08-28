import React from 'react'
import { Formik, FormikProps } from 'formik'
import * as Yup from 'yup'
import { newDoc } from '../../../../../shared/firebase'
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
  Alert,
} from 'reactstrap'

interface Props {
  propertyId: string
  isModalOpen?: boolean
  toggleModal?: () => void
}

interface NewUnitForm {
  label: string
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
    return (
      <Formik
        initialValues={{ label: '' }}
        validationSchema={unitValidationSchema}
        onSubmit={(
          values: NewUnitForm,
          { setStatus, setSubmitting, resetForm }: FormikProps<NewUnitForm>,
        ) => {
          const { propertyId } = this.props
          const upperCased = { label: values.label.toUpperCase() }
          newDoc(`properties/${propertyId}/units`, upperCased)
            .then(() => {
              toggleModal!()
              resetForm()
            })
            .catch((e: Error) => {
              setSubmitting(false)
              setStatus({ firebaseError: e.message })
            })
        }}
        render={({
          values,
          errors,
          status,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          submitForm,
          setStatus,
          resetForm,
        }: FormikProps<NewUnitForm>) => {
          const doToggle = () => {
            toggleModal!()
            resetForm()
          }
          return (
            <Modal centered isOpen={isModalOpen} toggle={doToggle}>
              <ModalHeader toggle={doToggle}>New Unit</ModalHeader>
              <ModalBody>
                {status && status.firebaseError ? (
                  <div>
                    <Alert
                      color="warning"
                      isOpen={true}
                      toggle={() => {
                        setStatus({ firebaseError: undefined })
                      }}>
                      {status.firebaseError}
                    </Alert>
                  </div>
                ) : null}
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
                <Button color="secondary" onClick={doToggle}>
                  Cancel
                </Button>
                <Button
                  className="btn-units"
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
