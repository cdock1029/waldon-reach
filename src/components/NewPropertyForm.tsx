import React from 'react'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { newDoc } from '../lib/firebase'
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
  isModalOpen?: boolean
  toggleModal?: () => void
}

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required()
    .max(200),
})
export class NewPropertyForm extends React.Component<Props> {
  render() {
    const { isModalOpen, toggleModal } = this.props
    const initial: Pick<Property, 'name'> = { name: '' }
    return (
      <Formik
        initialValues={initial}
        validationSchema={validationSchema}
        onSubmit={(values, { setStatus, setSubmitting, resetForm }) => {
          console.log('on submit:', { values })
          newDoc('properties', { name: values.name.toUpperCase() })
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
          status,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          submitForm,
          setStatus,
          resetForm,
        }) => {
          const doToggle = () => {
            toggleModal!()
            resetForm()
          }
          return (
            <Modal centered isOpen={isModalOpen} toggle={doToggle}>
              <ModalHeader toggle={doToggle}>New Property</ModalHeader>
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
                    <Label for="name">Property Name / Address</Label>
                    <Input
                      type="text"
                      name="name"
                      id="name"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {touched.name &&
                      errors.name && (
                        <FormText color="danger">{errors.name}</FormText>
                      )}
                  </FormGroup>
                </Form>
              </ModalBody>
              <ModalFooter>
                <Button color="secondary" onClick={doToggle}>
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
