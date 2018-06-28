import React from 'react'
import { Formik } from 'formik'
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

interface NewLeaseFormProps {
  propertyId?: string
  unitId?: string
  tenantId?: string
}

class NewLeaseForm extends React.Component<NewLeaseFormProps> {
  render() {
    const { propertyId, unitId, tenantId } = this.props
    return (
      <div>
        new lease form
        <div>
          <p>{propertyId}</p>
          <p>{unitId}</p>
          <p>{tenantId}</p>
        </div>
      </div>
    )
  }
}

export default NewLeaseForm
