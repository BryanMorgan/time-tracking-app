import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux'
import { Button, Modal } from 'semantic-ui-react'
import { deleteProjectRowApi } from '../service/time'
import moment from 'moment'

const DeleteProjectTimeRowModal = (props) => {

    function onClickConfirm() {
        const { projectId, taskId, startDate, endDate } = props

        return deleteProjectRowApi(startDate, endDate, projectId, taskId)
            .then(json => props.onSuccess(json))
            .catch(serviceError => props.onError(serviceError))
    }

    const { open, onCancel } = props

    return (
        <Modal size='small' dimmer='inverted' open={open} onClose={onCancel}>
            <Modal.Header>
                Delete Time Entries
                </Modal.Header>
            <Modal.Content image>
                <Modal.Description>
                    <p>Remove all project time entries for this week?</p>
                </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
                <Button primary onClick={onClickConfirm}>Yes</Button>
                <Button onClick={onCancel}>No</Button>
            </Modal.Actions>
        </Modal>
    )
}

DeleteProjectTimeRowModal.propTypes = {
    open: PropTypes.bool,
    onSuccess: PropTypes.func,
    onError: PropTypes.func,
    onCancel: PropTypes.func,
    projectId: PropTypes.number,
    taskId: PropTypes.number,
    startDate: PropTypes.instanceOf(moment),
    endDate: PropTypes.instanceOf(moment),
}

export default connect()(DeleteProjectTimeRowModal)