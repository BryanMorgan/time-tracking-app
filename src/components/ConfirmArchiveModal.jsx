import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Button, Modal } from 'semantic-ui-react';

const ConfirmArchiveModal = (props) => {
    const { open, onCancel } = props

    function onClickConfirm() {
        return props.onSuccess()
    }

    return (
        <Modal size='tiny' dimmer='inverted' open={open} onClose={onCancel}>
            <Modal.Header>
                Confirm Archive
                </Modal.Header>
            <Modal.Content image>
                <Modal.Description>
                    <p>Archive {props.archiveTypeString}? You can un-archive if you change your mind.</p>
                </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
                <Button primary onClick={onClickConfirm}>Yes</Button>
                <Button onClick={onCancel}>No</Button>
            </Modal.Actions>
        </Modal>
    )
}

ConfirmArchiveModal.propTypes = {
    archiveTypeString: PropTypes.string,
    open: PropTypes.bool,
    onSuccess: PropTypes.func,
    onError: PropTypes.func,
    onCancel: PropTypes.func,
}

export default connect()(ConfirmArchiveModal)