import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import { Button, Dimmer, Icon, Loader, Table } from 'semantic-ui-react'
import { archiveTaskApi, getAllGlobalTasksApi } from '../service/clients'
import ConfirmModal from '../components/ConfirmModal'
import { addAllGlobalTasks, removeGlobalTask } from '../action/tasks'
import { handleServiceError } from '../components/Util'

const TasksPage = (props) => {
    const [loading, setLoading] = useState(false)
    const [archiveTaskId, setArchiveTaskId] = useState(-1)
    const [archiveTaskName, setArchiveTaskName] = useState('')
    const [openConfirmArchiveModal, setOpenConfirmArchiveModal] = useState(false)

    useEffect(() => {
        window.scrollTo(0, 0)
        if (!props.globalTasksFetched) {
            setLoading(true)
        }
        getAllGlobalTasksApi()
            .then(json => {
                props.addAllGlobalTasks(json)
            })
            .catch(serviceError => {
                console.error("Service Error", serviceError)
                props.handleServiceError(serviceError)
            })
            .finally(() => setLoading(false))
    }, [])

    function resetConfirmArchiveModalState() {
        setArchiveTaskId(-1)
        setArchiveTaskName('')
        setOpenConfirmArchiveModal(false)
    }

    function archiveTask(taskId) {
        setLoading(true)

        archiveTaskApi(taskId)
            .then(json => props.removeGlobalTask(taskId))
            .catch(serviceError => {
                console.error("Service Error", serviceError)
                props.handleServiceError(serviceError)
            })
            .finally(() => {
                resetConfirmArchiveModalState()
                setLoading(false)
            })
    }

    function onConfirmArchiveTask(id) {
        archiveTask(id)
    }

    function onClickViewArchived(e) {
        e.preventDefault()
        props.viewArchived(true)
    }

    function onClickEditTask(id, e) {
        e.preventDefault()
        props.history.push('/task/edit/' + id)
    }

    function onClickCreateTask(e) {
        e.preventDefault()
        props.history.push('/task/create')
    }

    function onClickArchiveTask(id, name, e) {
        setArchiveTaskName(name)
        setArchiveTaskId(id)
        setOpenConfirmArchiveModal(true)
    }

    const { globalTasks } = props

    if (loading) {
        return (
            <div className='Global--dimmer-loader'>
                <Dimmer active={loading} inverted>
                    <Loader inline size='large'>Loading Tasks...</Loader>
                </Dimmer>
            </div>
        )
    }

    let taskRows = []

    for (let task of globalTasks) {
        taskRows.push(
            <Table.Row key={task.id}>
                <Table.Cell>{task.name}</Table.Cell>
                <Table.Cell singleLine textAlign='right'>
                    <Button size='tiny' compact
                        onClick={(e) => onClickEditTask(task.id, e)}>Edit</Button>
                    <Button size='tiny' compact
                        onClick={(e) => onClickArchiveTask(task.id, task.name, e)}>Archive</Button>
                </Table.Cell>
            </Table.Row>
        )
    }

    return (
        <div className="Projects--container">

            <div className="Projects--button-row">
                <Button primary icon title='Add Task' alt='Add Task' onClick={onClickCreateTask}>
                    <Icon name='plus' /> Add Task
                    </Button>

                <Button icon title='View Archived' alt='View Archived' onClick={onClickViewArchived}>
                    <Icon name='archive' /> View Archived
                    </Button>
            </div>

            <Table compact unstackable>
                <Table.Body>
                    {taskRows}
                </Table.Body>
            </Table>


            <ConfirmModal
                open={openConfirmArchiveModal}
                title='Archive Task?'
                description={`Do you want to archive the ${archiveTaskName} task?`}

                onCancel={() => resetConfirmArchiveModalState()}
                onSuccess={() => onConfirmArchiveTask(archiveTaskId)} />
        </div>
    )
}


TasksPage.propTypes = {
    viewArchived: PropTypes.func,
}

const mapStateToProps = ({ tasks }) => {
    return {
        globalTasks: tasks.globalTasks,
        globalTasksFetched: tasks.globalTasksFetched,
    }
}

const mapDispatchToProps = dispatch => ({
    addAllGlobalTasks: (globalTasks) => {
        dispatch(addAllGlobalTasks(globalTasks))
    },

    removeGlobalTask: (taskId) => {
        dispatch(removeGlobalTask(taskId))
    },

    handleServiceError: (serviceError) => {
        handleServiceError(serviceError, dispatch)
    }

})

export default connect(mapStateToProps, mapDispatchToProps)(TasksPage)

