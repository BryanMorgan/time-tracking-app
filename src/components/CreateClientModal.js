import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Button, Dimmer, Form, Input, Loader, Modal } from 'semantic-ui-react';
import { createClientApi } from '../service/clients';
import { handleServiceError } from './Util';
import { isClientNameValid } from './Valid';

const requiredAction = { content: 'Required', disabled: true, color: 'red' }

const CreateClientModal = (props) => {
    const [clientName, setClientName] = useState('')
    const [clientNameError, setClientNameError] = useState(false)
    const [loading, setLoading] = useState(false)

    function setDefaultState() {
        setClientName('')
        setClientNameError(false)
    }

    function onChangeClientName(event) {
        setClientNameError(false)
        setClientName(event.target.value)
    }

    function saveClient(clientName) {
        setLoading(true)

        createClientApi({
            name: clientName,
        }).then(json => {
            props.onSuccess(json)
            setDefaultState()
        }).catch(serviceError => {
            console.error("Service Error", serviceError)
            props.handleServiceError(serviceError)
        }).finally(() => setLoading(false))
    }

    function onClickSave() {
        if (!isClientNameValid(clientName)) {
            return setClientNameError(true)
        }

        let trimmedClientName = clientName
        if (trimmedClientName) {
            trimmedClientName = trimmedClientName.trim()
        }

        saveClient(trimmedClientName)
    }

    function onClickCancel() {
        props.onCancel()
        setDefaultState()
    }

    const { open, onCancel } = props

    if (loading) {
        return (
            <Dimmer active={loading} inverted>
                <Loader size='large'>Saving Client...</Loader>
            </Dimmer>
        )
    }

    return (
        <div>
            <Modal closeOnDimmerClick={false} dimmer='inverted' open={open} onClose={onCancel}>
                <Modal.Header>
                    Create Client
                    </Modal.Header>
                <Modal.Content image>
                    <Modal.Description>
                        <Form>
                            <Form.Field>
                                <label>Client Name</label>
                                <Input name='ClientName' value={clientName} onChange={onChangeClientName}
                                    error={clientNameError} action={clientNameError ? requiredAction : null} />
                            </Form.Field>
                        </Form>
                    </Modal.Description>
                </Modal.Content>
                <Modal.Actions>
                    <Button primary onClick={onClickSave}>Save</Button>
                    <Button onClick={onClickCancel}>Cancel</Button>
                </Modal.Actions>
            </Modal>
        </div>
    )
}

CreateClientModal.propTypes = {
    open: PropTypes.bool,
    onSuccess: PropTypes.func,
    onCancel: PropTypes.func,
}

const mapDispatchToProps = dispatch => ({
    handleServiceError: (serviceError) => {
        handleServiceError(serviceError, dispatch)
    }
})

export default connect(null, mapDispatchToProps)(CreateClientModal)