import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux'
import { Button, Modal } from 'semantic-ui-react'

const ConfirmModal = (props) => {
    function onClickConfirm() {
        return props.onSuccess()
    }

    const { open, title, description, onCancel } = props

    return (
        <Modal size='tiny' dimmer='inverted' open={open} onClose={onCancel}>
            <Modal.Header>{title}</Modal.Header>
            <Modal.Content image>
                <Modal.Description>
                    <p>{description}</p>
                </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
                <Button primary onClick={onClickConfirm}>{props.confirmMessage || 'Yes'}</Button>
                {props.hideCancelButton === true
                    ? null
                    : <Button onClick={onCancel}>{props.cancelMessage || 'No'}</Button>
                }
            </Modal.Actions>
        </Modal>
    );
}

ConfirmModal.propTypes = {
    archiveTypeString: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    confirmMessage: PropTypes.string,
    cancelMessage: PropTypes.string,
    open: PropTypes.bool,
    hideCancelButton: PropTypes.bool,
    onSuccess: PropTypes.func,
    onError: PropTypes.func,
    onCancel: PropTypes.func,
}

export default connect()(ConfirmModal)