import React from 'react'
import { Formik } from 'formik'
import * as yup from 'yup'
import { newDoc, auth } from '../lib/firebase'
import { Alert } from 'reactstrap'
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
  isModalOpen: boolean
  toggleModal: () => void
}
class NewTenantForm extends React.Component<Props/*, {topLevelError: string}*/> {
  static schema = yup.object().shape({
    firstName: yup.string().label('First Name').required().min(2).default(''),
    lastName: yup.string().label('Last Name').required().min(2).default(''),
    email: yup.string().label('Email').required().email().default(''),
  })
  render() {
    const { isModalOpen, toggleModal } = this.props
    const activeCompany = auth.activeCompany
    return (
      <Formik
        initialValues={NewTenantForm.schema.cast(undefined) as Tenant}
        validationSchema={NewTenantForm.schema}
        onSubmit={(
          { firstName, lastName, email },
          { setSubmitting, setStatus, resetForm },
        ) => {
          // Promise.reject('test').catch(e => {
          //   setStatus({firebaseError: e.message || e})
          // })

          newDoc(`companies/${activeCompany}/tenants`, {
            firstName,
            lastName,
            email,
          })
            .then(() => {
              // setSubmitting(false)
              toggleModal()
              resetForm()
            })
            .catch(e => {
              setSubmitting(false)
              setStatus({firebaseError: e.message})
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
          status,
          setStatus
        }) => {
          console.log({status})
          return (
            <Modal centered isOpen={isModalOpen} toggle={toggleModal}>
              <ModalHeader
                className={css({ flexDirection: 'row' })}
                toggle={toggleModal}>
                New Tenant
              </ModalHeader>
              <ModalBody>
                {status && status.firebaseError ? (
                <div>
                <Alert color='warning' isOpen={true} toggle={() => {setStatus({firebaseError: undefined})
                }}>
                  {status.firebaseError}
                </Alert>
                </div>
                ) : null}
                <Form onSubmit={handleSubmit}>
                  <FormGroup>
                    <Label for="firstName">First Name</Label>
                    <Input
                      type="text"
                      name="firstName"
                      id="firstName"
                      value={values.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {touched.firstName &&
                      errors.firstName && (
                        <FormText color="danger">{errors.firstName}</FormText>
                      )}
                  </FormGroup>
                  <FormGroup>
                    <Label for="lastName">Last Name</Label>
                    <Input
                      type="text"
                      name="lastName"
                      id="lastName"
                      value={values.lastName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {touched.lastName &&
                      errors.lastName && (
                        <FormText color="danger">{errors.lastName}</FormText>
                      )}
                  </FormGroup>
                  <FormGroup>
                    <Label for="email">Email</Label>
                    <Input
                      type="email"
                      name="email"
                      id="email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {touched.email &&
                      errors.email && (
                        <FormText color="danger">{errors.email}</FormText>
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
                  Save Tenant
                </Button>
              </ModalFooter>
            </Modal>
          )
        }}
      />
    )
  }
}

export default NewTenantForm
