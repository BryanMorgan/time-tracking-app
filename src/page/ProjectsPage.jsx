import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import { Button, Dimmer, Icon, Loader, Table } from 'semantic-ui-react'
import { archiveProjectApi, getAllProjectsApi } from '../service/clients'
import ConfirmModal from '../components/ConfirmModal'
import { handleServiceError } from '../components/Util'

const ProjectsPage = (props) => {
    const [loading, setLoading] = useState(false)
    const [projects, setProjects] = useState([])
    const [archiveProjectId, setArchiveProjectId] = useState(-1)
    const [archiveProjectName, setArchiveProjectName] = useState('')
    const [openConfirmArchiveModal, setOpenConfirmArchiveModal] = useState(false)

    useEffect(() => {
        window.scrollTo(0, 0)

        getAllProjectsApi()
            .then(json => {
                setProjects(json || [])
            })
            .catch(serviceError => {
                console.error("Service Error", serviceError)
                props.handleServiceError(serviceError)
            })
            .finally(() => setLoading(false))
    }, [])

    function resetConfirmArchiveModalState() {
        setArchiveProjectId(-1)
        setArchiveProjectName('')
        setOpenConfirmArchiveModal(false)
    }

    function archiveProject(projectId) {
        setLoading(true)

        archiveProjectApi(projectId)
            .then(json => setProjects(projects.filter(project => project.id !== projectId)))
            .catch(serviceError => {
                console.error("Service Error", serviceError)
                props.handleServiceError(serviceError)
            })
            .finally(() => {
                setLoading(false)
                resetConfirmArchiveModalState()
            })
    }

    function createClientData(project) {
        return {
            clientId: project.clientId,
            clientName: project.clientName,
        }
    }

    function createProjectData(project) {
        return {
            id: project.id,
            name: project.name,
            Projects: project.Projects,
        }
    }

    function onConfirmArchiveProject(id) {
        archiveProject(id)
    }

    function onClickViewArchived(e) {
        e.preventDefault()
        props.viewArchived(true)
    }

    function onClickEditProject(id, e) {
        e.preventDefault()
        props.history.push('/projects/edit/' + id)
    }

    function onClickCreateProject(e) {
        e.preventDefault()
        props.history.push('/projects/create')
    }

    function onClickArchiveProject(id, name, e) {
        setArchiveProjectName(name)
        setArchiveProjectId(id)
        setOpenConfirmArchiveModal(true)
    }

    if (loading) {
        return (
            <div className='Global--dimmer-loader'>
                <Dimmer active={loading} inverted>
                    <Loader size='large'>Getting Projects...</Loader>
                </Dimmer>
            </div>
        )
    }

    // Use the sort order from the server to build a list of clients with sorted projects
    let clients = []
    let projectsByClient = {}
    for (let project of projects) {
        if (project && project.id) {
            let existingClient = projectsByClient[project.clientId]
            if (!existingClient) {
                existingClient = projectsByClient[project.clientId] = createClientData(project)
                clients.push(existingClient)
            }
            existingClient.projects = existingClient.projects || []
            existingClient.projects.push(createProjectData(project))
        }
    }

    let clientRows = []

    for (let client of clients) {
        clientRows.push(
            <Table.Row key={client.clientId} className='Project--summary-table-client-row'>
                <Table.Cell colSpan={2}
                    className='Project--summary-table-client-cell'>{client.clientName}</Table.Cell>
            </Table.Row>
        )
        for (let project of client.projects) {
            clientRows.push(
                <Table.Row key={'project-' + project.id} className='Project--summary-table-project-row'>
                    <Table.Cell>{project.name}</Table.Cell>
                    <Table.Cell singleLine textAlign='right'>
                        <Button size='tiny' compact
                            onClick={(e) => onClickEditProject(project.id, e)}>Edit</Button>
                        <Button size='tiny' compact
                            onClick={(e) => onClickArchiveProject(project.id, project.name, e)}>Archive</Button>
                    </Table.Cell>
                </Table.Row>
            )
        }
    }

    return (
        <div className="Projects--container">

            <div className="Projects--button-row">
                <Button primary icon title='Add Client' alt='Add Client' onClick={onClickCreateProject}>
                    <Icon name='plus' /> Add Project
                    </Button>

                <Button icon title='View Archived' alt='View Archived' onClick={onClickViewArchived}>
                    <Icon name='archive' /> View Archived
                    </Button>
            </div>

            <Table compact unstackable>
                <Table.Body>
                    {clientRows}
                </Table.Body>
            </Table>


            <ConfirmModal
                open={openConfirmArchiveModal}
                title='Archive Project?'
                description={`Do you want to archive the ${archiveProjectName} project?`}

                onCancel={() => resetConfirmArchiveModalState()}
                onSuccess={() => onConfirmArchiveProject(archiveProjectId)} />
        </div>

    );
}


ProjectsPage.propTypes = {
    viewArchived: PropTypes.func,
}

const mapDispatchToProps = dispatch => ({
    handleServiceError: (serviceError) => {
        handleServiceError(serviceError, dispatch)
    }
})

export default connect(null, mapDispatchToProps)(ProjectsPage)

