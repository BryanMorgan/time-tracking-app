import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux'
import { Button, Dimmer, Icon, Loader, Table } from 'semantic-ui-react'
import { getAllGlobalArchivedTasksApi, restoreArchivedTaskApi } from '../service/clients'
import ConfirmModal from '../components/ConfirmModal'
import { addGlobalTask } from '../action/tasks'
import { handleServiceError } from '../components/Util'

const ArchivedTasksPage = (props) => {
    const [loading, setLoading] = useState(false)
    const [archivedTasks, setArchivedTasks] = useState([])
    const [restoreTaskId, setRestoreTaskId] = useState(-1)
    const [restoreTaskName, setRestoreTaskName] = useState('')
    const [openConfirmRestoreModal, setOpenConfirmRestoreModal] = useState(false)

    useEffect(() => {
        setLoading(true)

        getAllGlobalArchivedTasksApi()
            .then(json => setArchivedTasks(json || []))
            .catch(serviceError => {
                console.error("Service Error", serviceError)
                props.handleServiceError(serviceError)
            })
            .finally(() => setLoading(false))
    }, [])

    function resetConfirmRestoreModalState() {
        setRestoreTaskId(-1)
        setRestoreTaskName('')
        setOpenConfirmRestoreModal(false)
    }

    function restoreArchivedTask(restoreTaskId) {
        setLoading(true)

        restoreArchivedTaskApi(restoreTaskId)
            .then(json => {
                let restoredTask = null
                let updatedArchivedTasks = []
                archivedTasks.forEach((task) => {
                    if (task.id === restoreTaskId) {
                        restoredTask = task
                    } else {
                        updatedArchivedTasks.push(task)
                    }
                })

                // Update the global task list
                props.addGlobalTask(restoredTask)

                setArchivedTasks(updatedArchivedTasks)
            })
            .catch(serviceError => {
                console.error("Service Error", serviceError)
                props.handleServiceError(serviceError)
            })
            .finally(() => {
                resetConfirmRestoreModalState()
                setLoading(false)
            })
    }

    function onConfirmRestoreTask(id) {
        restoreArchivedTask(id)
    }

    function onClickRestoreTask(id, name, e) {
        setRestoreTaskId(id)
        setRestoreTaskName(name)
        setOpenConfirmRestoreModal(true)
    }

    function onClickBackToTasks(e) {
        e.preventDefault()
        props.viewArchived(false)
    }


    if (loading) {
        return (
            <Dimmer active={loading} inverted>
                <Loader size='large'>Loading Tasks...</Loader>
            </Dimmer>
        )
    }

    let taskRows = []

    for (let task of archivedTasks) {
        taskRows.push(
            <Table.Row key={task.id} className='Task--summary-table-row'>
                <Table.Cell>{task.name}</Table.Cell>
                <Table.Cell singleLine textAlign='right'>
                    <Button size='tiny' compact
                        onClick={(e) => onClickRestoreTask(task.id, task.name, e)}>Restore</Button>
                </Table.Cell>
            </Table.Row>
        )
    }

    return (
        <div className="Tasks--container">

            <div className="Tasks--button-row">
                <Button primary icon alt='Back to Active'
                    onClick={onClickBackToTasks}>
                    <Icon name='arrow left' /> Back to Active
                    </Button>
            </div>

            {taskRows.length > 0 ?
                <Table compact unstackable>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell colSpan='2' className="Tasks--archived-table-header">
                                Archived Tasks
                                </Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {taskRows}
                    </Table.Body>
                </Table>
                :
                <div className="Tasks--archived-table-no-archived-text">
                    <h4>No archived tasks</h4>
                </div>

            }

            <ConfirmModal
                open={openConfirmRestoreModal}
                title='Restore Task?'
                description={`Do you want to restore the ${restoreTaskName} Task?`}

                onCancel={() => resetConfirmRestoreModalState()}
                onSuccess={() => onConfirmRestoreTask(restoreTaskId)} />

        </div>

    )
}

const mapDispatchToProps = dispatch => ({
    addGlobalTask: (globalTask) => {
        dispatch(addGlobalTask(globalTask))
    },

    handleServiceError: (serviceError) => {
        handleServiceError(serviceError, dispatch)
    }
})

export default connect(null, mapDispatchToProps)(ArchivedTasksPage)

