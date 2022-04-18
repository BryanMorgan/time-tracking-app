import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import {
    Button,
    Checkbox,
    Dimmer,
    Divider,
    Dropdown,
    Form,
    Icon,
    Input,
    Loader,
    //Responsive,
    Table
} from 'semantic-ui-react'
import {
    createProjectApi,
    getAllClientsApi,
    getAllGlobalTasksApi,
    getProjectApi,
    updateProjectApi
} from '../service/clients'
import CreateTaskModal from '../components/CreateTaskModal'
import CreateClientModal from '../components/CreateClientModal'
import { addAllGlobalTasks, addGlobalTask } from '../action/tasks'
import { isProjectNameValid } from '../components/Valid'
import { compareTasks, convertRateStringToFloat, convertStringToId, handleServiceError } from '../components/Util'

const EDIT_PROJECT_PATH_PREFIX = '/projects/edit/'

const requiredAction = { content: 'Required', disabled: true, color: 'red' }

const CreateOrUpdateProjectPage = (props) => {
    const [loading, setLoading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState('')
    const [clients, setClients] = useState([])
    const [project, setProject] = useState({})
    const [projectTasks, setProjectTasks] = useState([])
    const [clientError, setClientError] = useState(false)
    const [projectNameError, setProjectNameError] = useState(false)
    const [openCreateTaskModal, setOpenCreateTaskModal] = useState(false)
    const [openCreateClientModal, setOpenCreateClientModal] = useState(false)
    
    const taskDropdownRef = useRef()
    const clientDropdownRef = useRef()

    useEffect(() => {
        const { pathname } = props.location
        let projectsPromise
        let globalTasksPromise

        if (pathname && pathname.startsWith(EDIT_PROJECT_PATH_PREFIX)) {
            let projectId = pathname.substring(EDIT_PROJECT_PATH_PREFIX.length)
            projectsPromise = getProject(projectId)
        }

        let clientsPromise = getClients()
        if (!props.globalTasksFetched) {
            globalTasksPromise = getGlobalTasks()
        }

        let project = {},
            projectTasks = [],
            clients = []

        taskDropdownRef.current = ''
        clientDropdownRef.current = ''

        // Fetch 3 services in parallel and process results based on return 'key'
        setLoading(true)
        setLoadingMessage('Retrieving Project...')

        Promise.all([projectsPromise, clientsPromise, globalTasksPromise])
            .then(result => {
                result.forEach(entry => {
                    if (!entry) return

                    switch (entry.key) {
                        case 'project':
                            if (!entry.project) return
                            project = entry.project
                            if (project.tasks) {
                                project.tasks.forEach(task => projectTasks.push(createProjectTask(task)))
                            }
                            break;
                        case 'clients':
                            if (entry.clients) {
                                clients = entry.clients
                            }
                            break;
                        case 'globalTasks':
                            if (entry.globalTasks) {
                                props.addAllGlobalTasks(entry.globalTasks)
                            }
                            break;
                        default:
                            console.error('Invalid promise entry key: ' + entry.key);
                    }
                })

                setProject(project)
                setProjectTasks(projectTasks)
                setClients(clients)
            })
            .catch(error => {
                console.error("Failed to retrieve data", error)
                props.handleServiceError(error)
            })
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        clientDropdownRef.current = project.clientId
    }, [project])

    async function getProject(projectId) {
        return {
            key: 'project',
            project: await getProjectApi(projectId)
                .then(json => json)
                .catch(serviceError => {
                    console.error("Service Error", serviceError)
                    props.handleServiceError(serviceError)
                    return null
                })
        }
    }

    async function getClients() {
        return {
            key: 'clients',
            clients: await getAllClientsApi()
                .then(json => json ? json.map(client => createClient(client)) : null)
                .catch(serviceError => {
                    console.error("Service Error", serviceError)
                    props.handleServiceError(serviceError)
                    return null
                })
        }
    }

    async function getGlobalTasks() {
        return {
            key: 'globalTasks',
            globalTasks: await getAllGlobalTasksApi()
                .then(json => {
                    let tasks = []
                    if (json) {
                        for (let task of json) {
                            tasks.push({
                                id: task.id,
                                name: task.name,
                                defaultBillable: task.defaultBillable,
                                common: task.common,
                                defaultRate: task.defaultRate || '',
                            })
                        }
                    }

                    return tasks
                })
                .catch(serviceError => {
                    console.error("Service Error", serviceError)
                    props.handleServiceError(serviceError)
                    return null
                })
        }
    }

    function createProject() {
        setLoadingMessage(true)
        setLoadingMessage('Creating Project...')

        let newProjectTasks = [...projectTasks]

        // Ensure rate is a float (empty rate is stored as '')
        normalizeProjectTaskRates(newProjectTasks)

        createProjectApi(project, newProjectTasks)
            .then(json => {
                setLoading(false)
                props.history.push('/projects')
            })
            .catch(serviceError => {
                console.error("Service Error", serviceError)
                props.handleServiceError(serviceError)
                setLoading(false)
            })
    }

    function updateProject() {
        setLoadingMessage(true)
        setLoadingMessage('Updating Project...')

        let newProjectTasks = [...projectTasks]

        // Ensure rate is a float (empty rate is stored as '')
        normalizeProjectTaskRates(newProjectTasks)

        updateProjectApi(project, newProjectTasks)
            .then(json => {
                setLoading(false)
                props.history.push('/projects')
            })
            .catch(serviceError => {
                console.error("Service Error", serviceError)
                props.handleServiceError(serviceError)
                setLoading(false)
            })
    }

    function createProjectTask(task) {
        let projectTask = Object.assign({}, task)
        projectTask.billable = task.billable || task.defaultBillable
        projectTask.rate = task.rate || task.defaultRate
        return projectTask
    }

    function createClient(client) {
        return {
            id: client.id,
            name: client.name,
        }
    }

    function getTaskById(taskId, tasks) {
        let taskIdInt = convertStringToId(taskId)

        for (let task of tasks) {
            if (task.id === taskIdInt) {
                return task
            }
        }
        return null
    }

    function normalizeProjectTaskRates(projectTasks) {
        if (projectTasks) {
            projectTasks.forEach(projectTask => projectTask.rate = convertRateStringToFloat(projectTask.rate))
        }
    }

    function updateTask(taskId, taskUpdate) {
        const newProjectTasks = [...projectTasks]
        if (taskId && taskUpdate) {
            let task = getTaskById(taskId, newProjectTasks)

            if (task) {
                Object.assign(task, taskUpdate)
                setProjectTasks(newProjectTasks)
            } else {
                console.error("Could not find task by id", taskId, newProjectTasks)
            }
        } else {
            console.error("Invalid task id or task rate", taskId, taskUpdate)
        }
    }

    function onChangeClient(e, data) {
        setProject({
            ...project,
            clientId: data.value,
            clientName: e.target.textContent
        })
        setClientError(false)
    }

    function onChangeProjectName(event) {
        setProject({
            ...project,
            name: event.target.value
        })
        setProjectNameError(false)
    }

    function onChangeRate(event, data) {
        if (data.name) {
            const taskId = data.name
            let taskRate = ''
            if (data.value) {
                taskRate = data.value.replace(/[^\d.]/g, '') // Only digits and '.' allowed
            }
            updateTask(taskId, { rate: taskRate })
        } else {
            console.error("Could not find task id and value for task", data)
        }
    }

    function onBlurRateChange(event) {
        let taskId = event.target.getAttribute('name')
        let taskRateString = event.target.getAttribute('value')
        let rate = ''
        if (taskRateString) {
            rate = parseFloat(taskRateString)
        }

        if (taskId) {
            updateTask(taskId, { rate: rate })
        } else {
            console.error("Could not find task id and value in blur event", taskId, taskRateString)
        }
    }

    function onClickBillableCheckbox(e, data) {
        if (data.name) {
            updateTask(data.name, { billable: data.checked })
        } else {
            console.error('Missing checkbox id', data)
        }
    }

    function onClickRemoveTaskFromProject(e, data) {
        e.preventDefault()
        let newProjectTasks = [...projectTasks]
        let taskId = data.name
        if (taskId) {
            for (let i = 0; i < newProjectTasks.length; i++) {
                if (newProjectTasks[i].id === taskId) {
                    newProjectTasks.splice(i, 1)
                    break
                }
            }
            setProjectTasks(newProjectTasks)
        } else {
            console.error('Invalid taskId: ' + taskId)
        }
    }

    function onClickOpenCreateTaskModal(e) {
        e.preventDefault()
        setOpenCreateTaskModal(true)
    }

    function onClickOpenCreateClientModal(e) {
        e.preventDefault()
        setOpenCreateClientModal(true)
    }

    function onSuccessCreateTaskModal(taskJson) {
        setOpenCreateTaskModal(false)

        if (taskJson) {
            let newProjectTasks = [...projectTasks]
            newProjectTasks.push(createProjectTask(taskJson))
            newProjectTasks.sort(compareTasks)

            setProjectTasks(newProjectTasks)
            props.addGlobalTask(taskJson)

        } else {
            console.error('Invalid task response', taskJson)
        }
    }

    function onClickCancelCreateTaskModal() {
        setOpenCreateTaskModal(false)
    }

    function onSuccessCreateClientModal(clientJson) {
        setOpenCreateClientModal(false)
        if (clientJson) {
            setProject({
                ...project,
                clientId: clientJson.id,
                clientName: clientJson.name,
            })
            setClients([createClient(clientJson), ...clients])
            setClientError(false)
        } else {
            console.error('Invalid client response', clientJson)
        }
    }

    function onClickCancelCreateClientModal() {
        setOpenCreateClientModal(false)
    }

    function onCloseTaskDropdown(e) {
        if (!e) {
            return
        }

        let newProjectTasks = [...projectTasks]
        let { globalTasks } = props
        let taskId = null

        if (e && e.target && e.target.id) {
            taskId = convertStringToId(e.target.id)
        } else {
            let selectedItem = taskDropdownRef.current.getSelectedItem()
            if (selectedItem) {
                taskId = convertStringToId(selectedItem.id)
            }
        }

        if (taskId !== null) {
            let task = null
            for (let globalTask of globalTasks) {
                if (globalTask.id === taskId) {
                    task = Object.assign({}, globalTask)
                    break
                }
            }

            if (task) {
                let existingTask = false
                for (let projectTask of newProjectTasks) {
                    if (projectTask.id === task.id) {
                        existingTask = true
                        break
                    }
                }

                if (!existingTask) {
                    newProjectTasks.push(createProjectTask(task))
                    newProjectTasks.sort(compareTasks)
                }
            }
        }

        taskDropdownRef.current = ''
        setProjectTasks(newProjectTasks)
    }

    function onClickCreateOrUpdateProject(e) {
        e.preventDefault()

        if (!project.clientId) {
            setClientError(true)
            return
        }

        if (!isProjectNameValid(project.name)) {
            setProjectNameError(true)
            return
        }

        if (props.create) {
            createProject()
        } else {
            updateProject()
        }
    }

    function onClickCancel(e) {
        e.preventDefault()
        props.history.push('/projects')
    }

    function createClientOption(client) {
        return {
            key: client.id,
            value: client.id,
            text: client.name,
        }
    }

    const { globalTasks, create } = props

    if (loading) {
        return (
            <Dimmer active={loading} inverted>
                <Loader size='large'>{loadingMessage}</Loader>
            </Dimmer>
        )
    }

    let clientOptions = []
    if (clients.length > 0) {
        clients.map(client => clientOptions.push(createClientOption(client)))
    }

    if (project.name === undefined || project.name === null) {
        project.name = ''
    }

    let taskRows = []
    let taskOptions = []

    if (projectTasks && projectTasks.length > 0) {
        for (let task of projectTasks) {
            let taskCells = []
            taskCells.push(<Table.Cell key={task.id + 'name'}
                className='Project--task-table-task-name'>{task.name}</Table.Cell>)
            taskCells.push(
                <Table.Cell key={task.id + 'check'} className='Project--task-table-billable'>
                    <Checkbox defaultChecked={task.billable} onChange={onClickBillableCheckbox}
                        name={task.id.toString()} />
                </Table.Cell>
            )

            taskCells.push(
                <Table.Cell key={task.id + 'rate'} className='Project--task-table-rate-container'>
                    <Input value={task.rate || ''} className='Project--task-table-rate'
                        onChange={onChangeRate}
                        onBlur={onBlurRateChange} name={task.id} disabled={!task.billable} icon='dollar sign' iconPosition='left' />
                </Table.Cell>)

            taskCells.push(
                <Table.Cell collapsing key={task.id + 'delete'} className='Project--task-table-delete'>
                    <Button size='mini' icon title='Delete task' alt='Delete task'
                        className='Project--task-table-delete-button' name={task.id}
                        onClick={onClickRemoveTaskFromProject}>
                        <Icon name='x' size='large' style={{ lineHeight: 0.9 }} />
                    </Button>
                </Table.Cell>
            )

            taskRows.push(<Table.Row key={task.id}>{taskCells}</Table.Row>)
        }
    }

    if (globalTasks) {
        globalTasks.map(globalTask => taskOptions.push({
            text: globalTask.name,
            value: globalTask.id,
            id: globalTask.id
        }))
    }

    return (
        <div className="Projects--container Projects--container-create-update">

            <div>
                <h1>{create ? 'Create' : 'Update'} Project</h1>
                <Divider />
            </div>

            <Form>

                <Form.Field>
                    <label>Project Name</label>
                    <Input fluid type='text' value={project.name} onChange={onChangeProjectName}
                        error={projectNameError} action={projectNameError ? requiredAction : null}
                    />
                </Form.Field>

                <Form.Field>
                    <label>Client</label>
                    <Dropdown fluid
                        search selection
                        options={clientOptions}
                        defaultValue={project.clientId}
                        error={clientError}
                        onChange={onChangeClient}
                        onOpen={() => clientError ? setClientError(false) : null}
                        ref={clientDropdownRef}
                    />
                    <Button icon onClick={onClickOpenCreateClientModal} floated='right'
                        className='Projects--new-client-button'>
                        <Icon name='plus' /> New Client
                        </Button>
                </Form.Field>

            </Form>

            <Table singleLine unstackable>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell width={11}>Tasks</Table.HeaderCell>
                        <Table.HeaderCell width={1}
                            className='Project--task-table-billable'>Billable</Table.HeaderCell>
                        <Table.HeaderCell width={2} className='Project--task-table-rate'>Hourly
                                Rate</Table.HeaderCell>
                        <Table.HeaderCell width={1} />
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {taskRows}
                </Table.Body>

                <Table.Footer>
                    <Table.Row>
                        <Table.HeaderCell colSpan='4'>
                            <div className='Project--task-table-footer-buttons'>
                                <Dropdown search selection fluid options={taskOptions}
                                    onClose={onCloseTaskDropdown}
                                    ref={taskDropdownRef}
                                />
                            </div>
                        </Table.HeaderCell>
                    </Table.Row>
                    <Table.Row>
                        <Table.HeaderCell colSpan='4'>
                            <Button icon onClick={onClickOpenCreateTaskModal} floated='right'
                                className='Project--task-bottom-add-task-button'>
                                <Icon name='plus' /> New Task
                                </Button>
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Footer>

            </Table>

            <div className='Project--task-bottom-button-container'>
                <Button positive
                    onClick={onClickCreateOrUpdateProject}>{create ? 'Save' : 'Update'} Project</Button>
                <Button onClick={onClickCancel}>Cancel</Button>
            </div>


            <CreateTaskModal open={openCreateTaskModal} onCancel={onClickCancelCreateTaskModal}
                onSuccess={onSuccessCreateTaskModal} />

            <CreateClientModal open={openCreateClientModal} onCancel={onClickCancelCreateClientModal}
                onSuccess={onSuccessCreateClientModal} />
        </div>
    )
}

CreateOrUpdateProjectPage.propTypes = {
    create: PropTypes.bool,
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

    addGlobalTask: (globalTask) => {
        dispatch(addGlobalTask(globalTask))
    },

    handleServiceError: (serviceError) => {
        handleServiceError(serviceError, dispatch)
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(CreateOrUpdateProjectPage)
