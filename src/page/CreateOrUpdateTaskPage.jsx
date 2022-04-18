import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import { Button, Dimmer, Divider, Form, Loader } from 'semantic-ui-react'
import { createTaskApi, getTaskApi, updateTaskApi } from '../service/clients'
import { isTaskNameValid } from '../components/Valid'
import { convertRateStringToFloat, handleServiceError } from '../components/Util'
import { addGlobalTask, updateGlobalTask } from '../action/tasks'

const EDIT_TASK_PATH_PREFIX = '/task/edit/'

const requiredAction = { content: 'Required', disabled: true, color: 'red' }

const CreateOrUpdateTaskPage = (props) => {
    const [loading, setLoading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState('')
    const [task, setTask] = useState({
        name: '',
        defaultBillable: true,
        defaultRate: '',
    })
    const [taskError, setTaskError] = useState(false)
    const [taskNameError, setTaskNameError] = useState(false)
    const [taskDropdownPopulated, setTaskDropdownPopulated] = useState(false)
    const [taskDropdownValue, setTaskDropdownValue] = useState({})

    useEffect(() => {
        const { pathname } = props.location

        if (pathname && pathname.startsWith(EDIT_TASK_PATH_PREFIX)) {
            let taskId = pathname.substring(EDIT_TASK_PATH_PREFIX.length)
            setLoading(true)
            setLoadingMessage('Loading Task...')
            getTaskApi(taskId)
                .then(json => setTask(json || {}))
                .catch(serviceError => {
                    console.error("Service Error", serviceError)
                    props.handleServiceError(serviceError)
                })
                .finally(() => setLoading(false))
        }
    }, [])

    function createTask() {
        setLoading(true)
        setLoadingMessage('Creating Task...')

        // Ensure rates are sent as floats
        let newTask = Object.assign({}, task)
        newTask.defaultRate = convertRateStringToFloat(newTask.defaultRate)

        createTaskApi(newTask)
            .then(json => {
                setLoading(false)
                props.addGlobalTask(json)
                props.history.push('/tasks')
            })
            .catch(serviceError => {
                console.error("Service Error", serviceError)
                props.handleServiceError(serviceError)
                setLoading(false)
            })
    }

    function updateTask() {
        setLoading(true)
        setLoadingMessage('Updating Task...')

        // Ensure rates are sent as floats
        let newTask = Object.assign({}, task)
        newTask.defaultRate = convertRateStringToFloat(newTask.defaultRate)

        updateTaskApi(newTask)
            .then(json => {
                setLoading(false)
                props.updateGlobalTask(newTask)
                props.history.push('/tasks')
            })
            .catch(serviceError => {
                console.error("Service Error", serviceError)
                props.handleServiceError(serviceError)
                setLoading(false)
            })
    }

    function onChangeTaskName(event) {
        setTaskNameError(false)
        setTask({
            ...task,
            name: event.target.value
        })
    }

    function onChangeTaskRate(event, data) {
        let taskRate = ''
        if (data.value) {
            taskRate = data.value.replace(/[^\d.]/g, '') // Only digits and '.' allowed
        }

        setTask({
            ...task,
            defaultRate: taskRate
        })
    }

    function onChangeTaskBillable(event, data) {
        setTask({
            ...task,
            defaultBillable: data.checked
        })
    }

    function onBlurRateChange(event) {
        let taskRateString = event.target.getAttribute('value')
        let rate = ''
        if (taskRateString) {
            rate = parseFloat(taskRateString)
        }

        setTask({
            ...task,
            defaultRate: rate
        })
    }


    function onClickCreateOrUpdateTask(e) {
        e.preventDefault()

        if (!isTaskNameValid(task.name)) {
            return setTaskNameError(true)
        }

        if (props.create) {
            createTask()
        } else {
            if (!task.id) {
                return setTaskError(true)
            }
            updateTask()
        }
    }

    function onClickCancel(e) {
        e.preventDefault()
        props.history.push('/tasks')
    }

    const { create } = props

    if (loading) {
        return (
            <Dimmer active={loading} inverted>
                <Loader size='large'>{loadingMessage}</Loader>
            </Dimmer>
        )
    }

    if (task.name === undefined || task.name === null) {
        task.name = ''
    }

    return (
        <div className="Projects--container Projects--container-create-update">

            <div>
                <h1>{create ? 'Create' : 'Update'} Task</h1>
                <Divider />
            </div>

            <Form>
                <Form.Field>
                    <label>Task Name</label>
                    <Form.Input fluid type='text' value={task.name} onChange={onChangeTaskName}
                        error={taskNameError || taskError} action={taskNameError ? requiredAction : null} />
                </Form.Field>
                <Form.Group inline>
                    <Form.Field>
                        <label>Rate</label>
                        <Form.Input type='number'
                            value={task.defaultRate || ''}
                            onChange={onChangeTaskRate}
                            onBlur={onBlurRateChange}
                            icon='dollar sign'
                            iconPosition='left'
                            disabled={!task.defaultBillable}
                        />
                    </Form.Field>
                    <Form.Field>
                        <label>Billable</label>
                        <Form.Checkbox defaultChecked={task.defaultBillable} onChange={onChangeTaskBillable} />
                    </Form.Field>
                </Form.Group>
            </Form>

            <div className='Task--bottom-button-container'>
                <div>
                    <Button positive
                        onClick={onClickCreateOrUpdateTask}>{create ? 'Create' : 'Update'} Task</Button>
                    <Button onClick={onClickCancel}>Cancel</Button>
                </div>
            </div>
        </div>
    )
}

CreateOrUpdateTaskPage.propTypes = {
    create: PropTypes.bool,
}

const mapDispatchToProps = dispatch => ({
    addGlobalTask: (task) => {
        dispatch(addGlobalTask(task))
    },

    updateGlobalTask: (task) => {
        dispatch(updateGlobalTask(task))
    },

    handleServiceError: (serviceError) => {
        handleServiceError(serviceError, dispatch)
    }
})

export default connect(null, mapDispatchToProps)(CreateOrUpdateTaskPage)

