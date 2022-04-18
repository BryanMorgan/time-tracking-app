import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Button, Checkbox, Dimmer, Form, Input, Loader, Modal } from 'semantic-ui-react';
import { createTaskApi } from '../service/clients';
import { convertRateStringToFloat, handleServiceError } from './Util';

const CreateTaskModal = (props) => {
    const [loading, setLoading] = useState(false)
    const [taskName, setTaskName] = useState('')
    const [billable, setBillable] = useState(true)
    const [rate, setRate] = useState('')

    function setDefaultState() {
        setTaskName('')
        setBillable(true)
        setRate('')
    }

    function onChangeTaskName(e) {
        setTaskName(e.target.value)
    }

    function onChangeBillable(e, data) {
        setBillable(data.checked)
    }

    function onChangeRate(event, data)  {
        let taskRate = ''
        if (data.value) {
            taskRate = data.value.replace(/[^\d.]/g, '') // Only digits and '.' allowed
        }
        setRate(taskRate)
    }

    function saveTask(taskName, billable, rate) {
        setLoading(true)
        createTaskApi({
            name: taskName,
            defaultBillable: billable,
            defaultRate: convertRateStringToFloat(rate),
        }).then(json => {
            props.onSuccess(json)
            setDefaultState()
        }).catch(serviceError => {
            console.error("Service Error", serviceError)
            props.handleServiceError(serviceError)
        }).finally(() => setLoading(false))
    }

    function onClickSave () {
        let trimmedTaskName = taskName
        if (taskName) {
            trimmedTaskName = taskName.trim()
        }

        let rateAsFloat = rate
        if (rate) {
            rateAsFloat = parseFloat(rate)
        }

        saveTask(trimmedTaskName, billable, rateAsFloat)
    }

    function onClickCancel  () {
        props.onCancel()
        setDefaultState()
    }


    const { open, onCancel } = props

    if (loading) {
        return (
            <Dimmer active={loading} inverted>
                <Loader size='large'>Saving Task...</Loader>
            </Dimmer>
        )
    }

    return (
        <div>
            <Modal closeOnDimmerClick={false} dimmer='inverted' open={open} onClose={onCancel}>
                <Modal.Header>
                    Create Task
                    </Modal.Header>
                <Modal.Content image>
                    <Modal.Description>
                        <Form>
                            <Form.Field>
                                <label>Task Name</label>
                                <Input name='taskName' value={taskName} onChange={onChangeTaskName} />
                            </Form.Field>
                            <Form.Field>
                                <Checkbox label='Billable' defaultChecked={billable}
                                    onChange={onChangeBillable} />
                            </Form.Field>
                            <Form.Field>
                                <label>Hourly Rate</label>
                                <Input name='rate' onChange={onChangeRate} value={rate}
                                    icon='dollar sign' iconPosition='left'
                                    disabled={!billable}
                                />
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

CreateTaskModal.propTypes = {
    open: PropTypes.bool,
    onSuccess: PropTypes.func,
    onCancel: PropTypes.func,
}

const mapDispatchToProps = dispatch => ({
    handleServiceError: (serviceError) => {
        handleServiceError(serviceError, dispatch)
    }
})

export default connect(null, mapDispatchToProps)(CreateTaskModal)