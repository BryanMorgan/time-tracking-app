import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux'
import { Button, Dimmer, Icon, Loader, Table } from 'semantic-ui-react'
import { getArchivedProjectsApi, restoreArchivedProjectsApi } from '../service/clients'
import ConfirmModal from '../components/ConfirmModal'
import { handleServiceError } from '../components/Util'

const ArchiveProjectsPage = (props) => {
    const [loading, setLoading] = useState(false)
    const [archivedProjects, setArchivedProjects] = useState([])
    const [restoreProjectId, setRestoreProjectId] = useState(-1)
    const [restoreProjectName, setRestoreProjectName] = useState('')
    const [openConfirmRestoreModal, setOpenConfirmRestoreModal] = useState(false)

    useEffect(() => {
        setLoading(true)
        getArchivedProjectsApi()
            .then(json => setArchivedProjects(json || []))
            .catch(serviceError => {
                console.error("Service Error", serviceError)
                props.handleServiceError(serviceError)
            })
            .finally(() => setLoading(false))
    }, [])

    function resetConfirmRestoreModalState() {
        setRestoreProjectId(-1)
        setRestoreProjectName('')
        setOpenConfirmRestoreModal(false)
    }

    function restoreArchivedProject(restoreProjectId) {
        setLoading(true)

        restoreArchivedProjectsApi(restoreProjectId)
            .then(json => {
                let updatedArchivedProjects = archivedProjects.filter(project => project.id !== restoreProjectId)
                setArchivedProjects(updatedArchivedProjects)
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

    function createProjectData(project) {
        return {
            ProjectId: project.ProjectId,
            ProjectName: project.ProjectName,
        }
    }

    function createProjectData(project) {
        return {
            id: project.id,
            name: project.name,
            tasks: project.tasks,
        }
    }

    function onConfirmRestoreProject(id) {
        restoreArchivedProject(id)
    }

    function onClickRestoreProject(id, name, e) {
        setRestoreProjectName(name)
        setRestoreProjectId(id)
        setOpenConfirmRestoreModal(true)        
    }

    function onClickBackToProjects(e) {
        e.preventDefault()
        props.viewArchived(false)
    }

    if (loading) {
        return (
            <Dimmer active={loading} inverted>
                <Loader size='large'>Loading Projects...</Loader>
            </Dimmer>
        )
    }

    let ProjectRows = []
    let Projects = []
    let projectsByProject = {}
    for (let project of archivedProjects) {
        if (project && project.id) {
            let existingProject = projectsByProject[project.ProjectId]
            if (!existingProject) {
                existingProject = projectsByProject[project.ProjectId] = createProjectData(project)
                Projects.push(existingProject)
            }
            existingProject.projects = existingProject.projects || []
            existingProject.projects.push(createProjectData(project))
        }
    }

    for (let Project of Projects) {
        ProjectRows.push(
            <Table.Row key={Project.id} className='Project--summary-table-Project-row'>
                <Table.Cell colSpan={2}
                    className='Project--summary-table-Project-cell'>{Project.ProjectName}</Table.Cell>
            </Table.Row>
        )
        for (let project of Project.projects) {
            ProjectRows.push(                
                <Table.Row key={'project-' + project.id} className='Project--summary-table-project-row'>
                    <Table.Cell>{project.name}</Table.Cell>
                    <Table.Cell singleLine textAlign='right'>
                        <Button size='tiny' compact
                            onClick={(e) => onClickRestoreProject(project.id, project.name, e)}>Restore</Button>
                    </Table.Cell>
                </Table.Row>
            )
        }
    }

    return (
        <div className="Projects--container">

            <div className="Projects--button-row">
                <Button primary icon alt='Back to Active'
                    onClick={onClickBackToProjects}>
                    <Icon name='arrow left' /> Back to Active
                    </Button>
            </div>

            {ProjectRows.length > 0 ?
                <Table compact unstackable>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell colSpan='2' className="Projects--archived-table-header">
                                Archived Projects
                                </Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {ProjectRows}
                    </Table.Body>
                </Table>
                :
                <div className="Projects--archived-table-no-archived-text">
                    <h4>No archived projects</h4>
                </div>

            }

            <ConfirmModal
                open={openConfirmRestoreModal}
                title='Restore Project?'
                description={`Do you want to restore the ${restoreProjectName} project?`}

                onCancel={() => resetConfirmRestoreModalState()}
                onSuccess={() => onConfirmRestoreProject(restoreProjectId)} />
        </div>

    )
}

const mapDispatchToProps = dispatch => ({
    handleServiceError: (serviceError) => {
        handleServiceError(serviceError, dispatch)
    }
})

export default connect(null, mapDispatchToProps)(ArchiveProjectsPage)
