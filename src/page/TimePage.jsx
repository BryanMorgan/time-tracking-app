import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Button, Dimmer, Dropdown, Form, Icon, Input, Loader, Modal,  Segment, Table } from 'semantic-ui-react';
import DeleteProjectTimeRowModal from '../components/DeleteProjectTimeRowModal';
import useIsMobile from '../components/IsMobile';
import {
    compareProjects,
    createProjectTaskDateId,
    DATE_PICKER_FORMAT, getShortDateString,
    handleServiceError,
    isDateFormatValid,
    parseProjectTaskDateId
} from '../components/Util';
import { copyProjectsFromPriorWeekApi } from '../service/clients';
import {
    addProjectRowApi,
    getProjectsAndTasksApi,
    getTimeWeekApi,
    saveTimeChangesApi
} from '../service/time';

const TIME_BASE_URL = '/time/'

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const TimePage = (props) => {
    const now = dayjs().startOf('day')

    const [bootupLoading, setBootupLoading] = useState(false)
    const [loading, setLoading] = useState(false)
    const isMobile = useIsMobile();

    // Time Entry
    const [currentDate, setCurrentDate] = useState(now)
    const [startDate, setStartDate] = useState(now)
    const [endDate, setEndDate] = useState(dayjs(now).add(7, 'day'),)
    const [projectTimeEntryRows, setProjectTimeEntryRows] = useState([])

    const [enableSaveButton, setEnableSaveButton] = useState(false)
    const [showSavingLoader, setShowSavingLoader] = useState(false)
    const [deleteProjectRowProjectId, setDeleteProjectRowProjectId] = useState(-1)
    const [deleteProjectRowTaskId, setDeleteProjectRowTaskId] = useState(-1)

    // Change cache
    const [changedProjectTimeEntryCache, setChangedProjectTimeEntryCache] = useState({})

    // Prior week copy result
    const [priorWeekEmpty, setPriorWeekEmpty] = useState(false)

    // Add Project/Task modal
    const [availableClientsProjectsTasks, setAvailableClientsProjectsTasks] = useState([])
    const [openAddProjectsModal, setOpenAddProjectsModal] = useState(false)
    const [projectsModalClient, setProjectsModalClient] = useState('')
    const [projectsModalProject, setProjectsModalProject] = useState('')
    const [projectsModalTask, setProjectsModalTask] = useState('')
    const [openConfirmDeleteProjectRowModal, setOpenConfirmDeleteProjectRowModal] = useState(false)
    const timeSaveTimer = React.useRef(null)

    function resetDeleteProjectRowModalState() {
        setDeleteProjectRowProjectId(-1)
        setDeleteProjectRowTaskId(-1)
        setOpenConfirmDeleteProjectRowModal(false)
    }

    const locale = (navigator.languages && navigator.languages[0]) || navigator.language
    const longFormatter = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' })
    const shortFormatter = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' })
    const weekdayFormatter = new Intl.DateTimeFormat(locale, { weekday: 'short' })
    const longWeekdayFormatter = new Intl.DateTimeFormat(locale, { weekday: 'long' })


    useEffect(() => {
        const { pathname } = props.location
        let startDateFromPath = dayjs(getStartDateFromPath(pathname))

        setBootupLoading(true)
        setCurrentDate(startDateFromPath)
        getTime(startDateFromPath)
        getProjectsAndTasks()    
        return () => {
            if (timeSaveTimer.current) {
                clearTimeout(timeSaveTimer.current)
            }
        }
    }, [])

    useEffect(() => {
        const { pathname } = props.location
        let newStartDate = dayjs(getStartDateFromPath(pathname))

        if (newStartDate.isAfter(endDate) || newStartDate.isBefore(startDate)) {
            getTime(newStartDate)
        } else {
            setCurrentDate(newStartDate)
        }
    }, [props.location.pathname])

    React.useEffect(() => {
        // Restart the timer here to pull in the updated changedProjectTimeEntryCache in the closure
        timeSaveTimer.current = setTimeout(onClickSaveTimeEntries, 5000)
    }, [changedProjectTimeEntryCache]);

    function isShowingCurrentWeek() {
        return now.isSameOrAfter(startDate) && now.isSameOrBefore(endDate)
    }

    function getProjectEntry(projects, projectId, taskId) {
        if (projects) {
            for (let project of projects) {
                if (project.projectId === projectId && project.taskId === taskId) {
                    return project
                }
            }
        }
        return null
    }

    function getStartDateFromPath(pathname) {
        let dateString = null
        if (pathname) {
            if (pathname !== TIME_BASE_URL && pathname !== TIME_BASE_URL.replace(/\/$/, "")) {
                if (pathname.startsWith(TIME_BASE_URL)) {
                    dateString = pathname.substring(TIME_BASE_URL.length)
                }

                if (dateString != null) {
                    if (dateString.length > 10) {
                        console.error("Invalid date in path: " + dateString)
                        dateString = dateString.substring(0, 10)
                    }

                    if (dateString.length < 10) {
                        console.error("Invalid date in path: " + dateString)
                        dateString = null
                    }
                }
            }
        }

        if (dateString === null) {
            dateString = getShortDateString(dayjs())
        }

        // Make sure date string is valid
        if (!isDateFormatValid(dateString)) {
            console.error('Invalid date path: ', dateString)
            dateString = getShortDateString(dayjs())
        }

        return dateString
    }

    function createEmptyProjectTimeEntryRow({ projectId, taskId, projectName, taskName, clientName }) {
        return {
            projectId,
            taskId,
            projectName,
            taskName,
            clientName,
            entries: []
        }
    }


    function getTime(startDay) {
        if (!startDay) {
            startDay = dayjs()
        }

        // Convert dayjs to simple short date string
        if (startDay instanceof dayjs) {
            startDay = getShortDateString(startDay)
        }

        setLoading(true)
        setPriorWeekEmpty(false)

        getTimeWeekApi(startDay)
            .then(json => {
                let savedProjectRows = buildProjectRowsFromJson(json)

                setStartDate(dayjs(json.start))
                setCurrentDate(dayjs(startDay))
                setEndDate(dayjs(json.end))
                setProjectTimeEntryRows(savedProjectRows)
            })
            .catch(serviceError => {
                console.error("Service Error", serviceError)
                props.handleServiceError(serviceError)
                setStartDate(now)
                setCurrentDate(dayjs(now))
                setEndDate(dayjs(now).add(7, 'day'))
            })
            .finally(() => {
                setBootupLoading(false)
                setLoading(false)
            })
    }

    function getProjectsAndTasks() {
        getProjectsAndTasksApi()
            .then(availableProjectsJson => {

                if (availableProjectsJson == null) {
                    availableProjectsJson = []
                }

                let savedClientsProjectsTasks = []
                let newCurrentClient
                let newCurrentProject
                let newCurrentTask

                // Loop over all the returned projects
                for (let project of availableProjectsJson) {
                    let client

                    // See if we already have a record for this client (top-level)
                    for (let savedClient of savedClientsProjectsTasks) {
                        if (savedClient.id === project.clientId) {
                            client = savedClient
                            break
                        }
                    }

                    // If not, create a client and add it to the saved list
                    if (!client) {
                        client = {
                            id: project.clientId,
                            key: project.clientId,
                            value: project.clientId,
                            text: project.clientName,
                            projects: []
                        }
                        savedClientsProjectsTasks.push(client)
                    }

                    if (!newCurrentClient) {
                        newCurrentClient = client
                    }

                    // Add all the saved tasks to the project
                    let savedTasks = []
                    if (project.tasks) {
                        for (let task of project.tasks) {
                            let savedTask = {
                                id: task.id,
                                key: task.id,
                                value: task.id,
                                text: task.name,
                            }

                            if (!newCurrentTask) {
                                newCurrentTask = savedTask
                            }

                            savedTasks.push(savedTask)
                        }
                    }

                    let savedProject = {
                        id: project.id,
                        key: project.id,
                        value: project.id,
                        text: project.name,
                        tasks: savedTasks
                    }

                    if (!newCurrentProject) {
                        newCurrentProject = savedProject
                    }

                    // Add the project to the client's list of projects
                    client.projects.push(savedProject)
                }

                setAvailableClientsProjectsTasks(savedClientsProjectsTasks)
                setProjectsModalClient(newCurrentClient)
                setProjectsModalProject(newCurrentProject)
                setProjectsModalTask(newCurrentTask)
            })
            .catch(serviceError => {
                console.error("Could not load projects and tasks", serviceError)
            })
    }

    function saveTimeEntries() {
        if (timeSaveTimer.current) {
            clearTimeout(timeSaveTimer.current)
        }

        if (Object.keys(changedProjectTimeEntryCache).length === 0) {
            return
        }

        setShowSavingLoader(true)

        saveTimeChangesApi(changedProjectTimeEntryCache)
            .then(() => {
                setChangedProjectTimeEntryCache({})
                setEnableSaveButton(false)
            })
            .catch(serviceError => {
                console.error(serviceError)
                props.handleServiceError(serviceError)
            })
            .finally(() => setShowSavingLoader(false))
    }

    function copyPriorWeek() {
        setLoading(true)
        setPriorWeekEmpty(false)

        copyProjectsFromPriorWeekApi(startDate, endDate)
            .then((json) => {
                if (!json) {
                    setPriorWeekEmpty(true)
                } else {
                    setProjectTimeEntryRows(buildProjectRowsFromJson(json))
                }
            })
            .catch(serviceError => {
                console.error("Service error saving time", serviceError)
                props.handleServiceError(serviceError)
            })
            .finally(() => setLoading(false))
    }

    function createTimeEntry(hours) {
        return {
            time: hours
        }
    }

    function buildProjectRowsFromJson(json) {
        let savedProjectRows = []
        if (json && json.entries) {
            for (let entry of json.entries) {
                let project = getProjectEntry(savedProjectRows, entry.projectId, entry.taskId)

                if (!project) {
                    project = createEmptyProjectTimeEntryRow(entry)
                    savedProjectRows.push(project)
                }

                project.entries[entry.day] = createTimeEntry(entry.hours)
            }
        }

        savedProjectRows.sort(compareProjects)
        return savedProjectRows
    }

    function addNewRow() {
        // See if a row already exists for this project/task combination. If so, do nothing
        for (let projectEntry of projectTimeEntryRows) {
            if (projectEntry.projectId === projectsModalProject.id && projectEntry.taskId === projectsModalTask.id) {
                // Project row already exists
                return Promise.resolve()
            }
        }

        return addProjectRowApi(startDate, endDate, projectsModalProject, projectsModalTask)
            .then(json => {
                // Assume success since json.data doesn't return anything yet
                let updatedProjectRows = [...projectTimeEntryRows]

                let projectTimeRow = createEmptyProjectTimeEntryRow({
                    projectId: projectsModalProject.id,
                    taskId: projectsModalTask.id,
                    projectName: projectsModalProject.text,
                    taskName: projectsModalTask.text,
                    clientName: projectsModalClient.text,
                })

                for (let day = dayjs(startDate); day.isSameOrBefore(endDate); day = day.add(1, 'day')) {
                    let shortDate = getShortDateString(day)
                    projectTimeRow.entries[shortDate] = createTimeEntry(0.0)
                }

                updatedProjectRows.push(projectTimeRow)

                updatedProjectRows.sort(compareProjects)

                setProjectTimeEntryRows(updatedProjectRows)
            })
            .catch(serviceError => {
                console.error(serviceError)
                props.handleServiceError(serviceError)
            })
    }

    function isDataUnsaved() {
        return Object.keys(changedProjectTimeEntryCache).length > 0
    }

    async function saveDataIfNeeded() {
        if (isDataUnsaved()) {
            return await saveTimeEntries()
        } else {
            return Promise.resolve()
        }
    }

    function onLastWeekClick() {
        saveDataIfNeeded()
            .then(updateStartDate(-7))
            .catch(console.error)
    }

    function onNextWeekClick() {
        saveDataIfNeeded()
            .then(updateStartDate(+7))
            .catch(console.error)
    }

    function onPreviousDayClick() {
        let newCurrentDate = dayjs(currentDate).subtract(1, 'day')

        if (newCurrentDate.isBefore(startDate)) {
            saveDataIfNeeded()
                .then(updateStartDate(-1))
                .catch(console.error)
        }
        else {
            setCurrentDate(newCurrentDate)
            props.history.push(TIME_BASE_URL + getShortDateString(newCurrentDate))
        }
    }

    function onNextDayClick() {
        let newCurrentDate = dayjs(currentDate).add(1, 'day')

        if (newCurrentDate.isAfter(endDate)) {
            saveDataIfNeeded()
                .then(updateStartDate(+7))
                .catch(console.error)
        }
        else {
            setCurrentDate(newCurrentDate)
            props.history.push(TIME_BASE_URL + getShortDateString(newCurrentDate))
        }
    }

    function onThisWeekClick() {
        if (!isShowingCurrentWeek()) {
            saveDataIfNeeded()
                .then(setCurrentDate(dayjs()))
                .then(props.history.push(TIME_BASE_URL))
                .catch(console.error)
        }
    }

    function onDatePickerChange(date) {
        saveDataIfNeeded()
            .then(setCurrentDate(dayjs(date)))
            .then(props.history.push(TIME_BASE_URL + getShortDateString(date)))
            .catch(console.error)
    }


    function updateStartDate(days) {
        let newStartDate = dayjs(startDate).add(days, 'day')
        props.history.push(TIME_BASE_URL + getShortDateString(newStartDate))
    }

    function showProjectTaskModal() { setOpenAddProjectsModal(true) }
    function closeProjectTaskModal() { setOpenAddProjectsModal(false) }

    function onSuccessDeleteProjectRow() {
        // Filter out the deleted project rows
        let updatedProjectRows = projectTimeEntryRows.filter(project => {
            if (project.projectId === deleteProjectRowProjectId && project.taskId === deleteProjectRowTaskId) {
                return null
            }
            return project
        })

        updatedProjectRows.sort(compareProjects)

        // Filter out the values in the cache if there were any updates
        let updatedChangedProjectTimeEntryCache = { ...changedProjectTimeEntryCache }
        for (let id of Object.keys(updatedChangedProjectTimeEntryCache)) {
            let values = parseProjectTaskDateId(id)
            if (values.projectId === deleteProjectRowProjectId
                && values.taskId === deleteProjectRowTaskId) {
                delete updatedChangedProjectTimeEntryCache[id]
            }
        }

        setProjectTimeEntryRows(updatedProjectRows)
        setChangedProjectTimeEntryCache(updatedChangedProjectTimeEntryCache)
        resetDeleteProjectRowModalState()
    }

    function onErrorDeleteProjectRow(serviceError) {
        resetDeleteProjectRowModalState()
        props.handleServiceError(serviceError)
    }

    function onCancelDeleteProjectRow() {
        resetDeleteProjectRowModalState()
    }

    function onChangeProjectsModalClient(e, data) {
        const clientId = data.value

        if (projectsModalClient.id !== clientId) {
            for (let client of availableClientsProjectsTasks) {
                if (client.id === clientId) {
                    let newCurrentProject = ''
                    let newCurrentTask = ''
                    if (client.projects.length > 0) {
                        newCurrentProject = client.projects[0]
                        if (newCurrentProject.tasks.length > 0) {
                            newCurrentTask = newCurrentProject.tasks[0]
                        }
                    }
                    setProjectsModalClient(client)
                    setProjectsModalProject(newCurrentProject)
                    setProjectsModalTask(newCurrentTask)
                    break
                }
            }
        }
    }

    function onChangeProjectsModalProject(e, data) {
        const projectId = data.value

        if (projectsModalProject.id !== projectId) {
            for (let project of projectsModalClient.projects) {
                if (project.id === projectId) {
                    let newCurrentTask = ''
                    if (project.tasks.length > 0) {
                        newCurrentTask = project.tasks[0]
                    }
                    setProjectsModalProject(project)
                    setProjectsModalTask(newCurrentTask)
                    break
                }
            }
        }
    }

    function onChangeProjectsModalTask(e, data) {
        const taskId = data.value

        if (projectsModalTask.id !== taskId) {
            for (let task of projectsModalProject.tasks) {
                if (task.id === taskId) {
                    setProjectsModalTask(task)
                    break
                }
            }
        }
    }

    function onClickProjectsModalSave() {
        addNewRow().then(setOpenAddProjectsModal(false))
    }

    function onClickDeleteProjectRow(e, data) {
        if (data.name) {
            let values = parseProjectTaskDateId(data.name)
            if (values.projectId && values.taskId) {
                setDeleteProjectRowProjectId(values.projectId)
                setDeleteProjectRowTaskId(values.taskId)
                setOpenConfirmDeleteProjectRowModal(true)
            } else {
                console.error('Invalid project/task id: ' + data.name)
            }
        } else {
            console.error('No name found')
        }
    }

    function onClickSaveTimeEntries() {
        saveTimeEntries()
    }

    function onClickCopyPriorWeek() {
        copyPriorWeek()
    }

    function onChangeTimeEntry(event, data) {
        if (data.name) {
            // Only digits and '.' allowed
            let timeEntry = data.value.replace(/[^\d.]/g, '')

            let projectTaskDateId = data.name
            let values = parseProjectTaskDateId(projectTaskDateId)
            if (values.projectId && values.taskId && values.date) {

                // Reset the save timer as entries are edited
                if (timeSaveTimer.current) {
                    clearTimeout(timeSaveTimer.current)
                }

                let updatedChangedProjectTimeEntryCache = { ...changedProjectTimeEntryCache }
                let updatedProjectTimeEntryRows = projectTimeEntryRows.slice()

                for (let project of updatedProjectTimeEntryRows) {
                    if (project.projectId === values.projectId && project.taskId === values.taskId) {
                        project.entries[values.date] = createTimeEntry(timeEntry)
                        updatedChangedProjectTimeEntryCache[projectTaskDateId] = timeEntry
                        break
                    }
                }

                setProjectTimeEntryRows(updatedProjectTimeEntryRows)
                setChangedProjectTimeEntryCache(updatedChangedProjectTimeEntryCache)
                setEnableSaveButton(true)
            }
        } else {
            console.error("Could not find name for time entry", data)
        }
    }

    // When a time entry blur event happens, parse the entry as a float to clean up things like 1.2.3.4
    function onBlurTimeEntry(event) {
        let projectTaskName = event.target.getAttribute('name')
        let timeEntryString = event.target.getAttribute('value')

        if (projectTaskName && timeEntryString) {
            let values = parseProjectTaskDateId(projectTaskName)
            let updatedProjectTimeEntryRows = projectTimeEntryRows.slice()
            for (let projectEntry of updatedProjectTimeEntryRows) {
                if (projectEntry.projectId === values.projectId && projectEntry.taskId === values.taskId && projectEntry.entries[values.date]) {
                    projectEntry.entries[values.date].time = parseFloat(timeEntryString)
                    break
                }
            }

            setProjectTimeEntryRows(updatedProjectTimeEntryRows)
        }
    }

    function getTableHeaderCell(date) {
        return (<Table.HeaderCell className='Time--table-header-cell' key={date.valueOf()}>
            {weekdayFormatter.format(date)}
            <div className='Time--header-date'>{shortFormatter.format(date)}</div>
        </Table.HeaderCell>)
    }

    function onHeaderDayClick(dateString) {
        if (!currentDate.isSame(dateString)) {
            setCurrentDate(dayjs(dateString))
            props.history.push(TIME_BASE_URL + getShortDateString(dateString))
        }
    }

    // Keep track of the week range and start/end for the week (desktop) or day (mobile)
    let weekEndDate = endDate
    let weekStartDate = startDate

    let isShowingThisWeek = isShowingCurrentWeek()
    let projectRowsElements = []
    let mobileHeaderDayRows = []
    let columnTotals = {}
    let sumColumnTotals = 0.0
    let headerRowCells = []
    let footerRowCells = []
    let emptyEntry = !projectTimeEntryRows || projectTimeEntryRows.length === 0

    // Create project rows

    if (bootupLoading) {
        return (
            <Dimmer active={bootupLoading} inverted>
                <Loader size='large'>Loading time entries...</Loader>
            </Dimmer>
        )
    }

    if (emptyEntry) {
        projectRowsElements.push(
            <Table.Row key='placeholder-row'>
                <Table.Cell colSpan="10">
                    <div className='Project--empty-table-row'>
                        <div className='Project--empty-table-row-content'>
                            {!priorWeekEmpty ?
                                <Segment raised>
                                    <h4>No time entered</h4>
                                    <Button className='Time-save-button' primary
                                        onClick={onClickCopyPriorWeek}>Copy Prior Week</Button>
                                </Segment>
                                :
                                <Segment>
                                    <h4>No entries saved last week</h4>
                                    <Button icon positive onClick={showProjectTaskModal}>
                                        <Icon name='plus' />
                                            Add Project
                                        </Button>
                                </Segment>
                            }
                        </div>
                    </div>
                </Table.Cell>
            </Table.Row>
        )
    } else {
        for (let project of projectTimeEntryRows) {
            let projectCells = []
            let rowId = createProjectTaskDateId(project.projectId, project.taskId)
            let rowTotal = 0.0

            let clientProjectTaskWidth = 1
            if (isMobile) {
                clientProjectTaskWidth = 10
            }

            projectCells.push(
                <Table.Cell key={rowId + 'name'} width={clientProjectTaskWidth}>
                    <div className='Time--table-client-name'>{project.clientName}</div>
                    <div className='Time--table-project-name'>{project.projectName}</div>
                    <div className='Time--table-task-name'>{project.taskName}</div>
                </Table.Cell>
            )

            // For each row, loop through the columns (weeks or day on mobile) and add up the column sums and create cells
            for (let date = dayjs(weekStartDate); date.isSameOrBefore(weekEndDate); date = date.add(1, 'day')) {
                let dateString = getShortDateString(date)
                let valueString = ''
                let value = 0

                if (project.entries[dateString] && project.entries[dateString].time) {
                    valueString = project.entries[dateString].time // so user's can type in a '.' (3.5)
                    value = parseFloat(valueString)
                    if (isNaN(value)) {
                        value = 0.0
                    }
                    if (!columnTotals[dateString]) {
                        columnTotals[dateString] = value
                    } else {
                        columnTotals[dateString] += value
                    }
                }

                // For mobile only add the single day's column cells
                if (!isMobile || date.isSame(currentDate)) {
                    rowTotal += value

                    // Create the cells for the column
                    let cellId = createProjectTaskDateId(project.projectId, project.taskId, dateString)
                    projectCells.push(
                        <Table.Cell className='Time--table-cell' key={cellId}>
                            <Input className='Time--cell-container' value={valueString} name={cellId}
                                onChange={onChangeTimeEntry}
                                onBlur={onBlurTimeEntry}
                            />
                        </Table.Cell>
                    )
                }
            }

            sumColumnTotals += rowTotal

            if (!Number.isInteger(rowTotal)) {
                rowTotal = parseFloat(rowTotal.toFixed(2))
            }

            // Add row total cell for desktop only
            if (!isMobile) {
                projectCells.push(
                    <Table.Cell className='Time--table-cell' key={rowId + 'total'}>{rowTotal}</Table.Cell>
                )
            }

            // Add delete button cell
            projectCells.push(
                <Table.Cell key={rowId + 'delete'} className='Time--table-header-cell-delete'>
                    <Button size='mini' icon title='Delete row' alt='Delete row' name={rowId}
                        onClick={onClickDeleteProjectRow}>
                        <Icon name='x' size='large' style={{ lineHeight: 0.9 }} />
                    </Button>
                </Table.Cell>
            )

            // Add cells to row
            projectRowsElements.push(
                <Table.Row key={rowId}>
                    {projectCells}
                </Table.Row>
            )
        }
    }

    // Create the header and footer rows
    for (let date = dayjs(weekStartDate); date.isSameOrBefore(weekEndDate); date = date.add(1, 'day')) {
        // Create the header and footer rows
        let dateString = getShortDateString(date)
        let columnTotal = columnTotals[dateString] || 0
        if (!Number.isInteger(columnTotal)) {
            columnTotal = parseFloat(columnTotal.toFixed(2))
        }

        if (!isMobile) {
            headerRowCells.push(getTableHeaderCell(date))
            footerRowCells.push(
                <Table.HeaderCell className='Time--table-footer-cell' key={date.valueOf()}>
                    <Input className='Time--cell-container Time--cell-container-footer' value={columnTotal} readOnly
                        disabled />
                </Table.HeaderCell>
            )
        } else {
            let cellBackgroundColor = 'white'
            let textColor = 'black'
            if (date.isSame(currentDate)) {
                headerRowCells.push(getTableHeaderCell(date))
                cellBackgroundColor = '#21ba45'
                textColor = 'white'
            }
            mobileHeaderDayRows.push(
                <Table.Cell key={dateString} className='Time--header-day-mobile'
                    style={{ backgroundColor: cellBackgroundColor }}
                    onClick={() => onHeaderDayClick(dateString)}>
                    <div className='Time--header-day-weekday-mobile'
                        style={{ color: textColor }}> {date.format('ddd').slice(0, 1)}</div>
                    <div className='Time--header-day-total-mobile' style={{ color: textColor }}>{columnTotal}</div>
                </Table.Cell>
            )
        }
    }

    if (!Number.isInteger(sumColumnTotals)) {
        sumColumnTotals = parseFloat(sumColumnTotals.toFixed(2))
    }

    footerRowCells.push(
        <Table.HeaderCell key='footer-all-rows-total' className='Time--table-footer-cell'>
            {sumColumnTotals}
        </Table.HeaderCell>
    )

    if (isMobile) {
        return (
            <div style={{ width: "100%" }} className="Time--container-mobile">
                <div className='Time--mobile-navigation-top'>
                    <div className='Time--mobile-navigation-buttons-date-nav'>
                        <Button icon onClick={onPreviousDayClick}
                            className="Time--mobile-navigation-button">
                            <Icon name='arrow left' />
                        </Button>

                        <div className="Time--mobile-navigation-date-container">
                            <div className='Time--loader-inline-mobile'>
                                <Loader inline active={loading} />
                            </div>
                            <div className='Time--mobile-navigation-date-picker'>
                                <DatePicker
                                    selected={currentDate.toDate()}
                                    onChange={onDatePickerChange}
                                    dateFormat={DATE_PICKER_FORMAT}
                                    calendarClassName='Time--date-picker'
                                    monthsShown={1}
                                    todayButton="Go to Today"
                                    customInput={
                                        <Button icon>
                                            <Icon name='calendar' />
                                        </Button>
                                    }
                                    popperPlacement="top-start"
                                />
                            </div>
                            <div className="Time--mobile-navigation-date-text">
                                {longWeekdayFormatter.format(currentDate)}, {shortFormatter.format(currentDate)}
                            </div>

                        </div>

                        <Button icon onClick={onNextDayClick}
                            className="Time--mobile-navigation-button">
                            <Icon name='arrow right' />
                        </Button>
                    </div>

                    <div className='Time--mobile-navigation-top'>
                        <Table unstackable className='Time--table'>
                            <Table.Body>
                                <Table.Row className='Time--header-day-row-mobile'>
                                    {mobileHeaderDayRows}
                                </Table.Row>
                            </Table.Body>
                        </Table>
                    </div>
                </div>


                <div className="Time--table-container">
                    <Table unstackable>
                        <Table.Body>
                            {projectRowsElements}
                        </Table.Body>

                        <Table.Footer>
                            <Table.Row>
                                <Table.HeaderCell width={10}>
                                    <h4>Total</h4>
                                </Table.HeaderCell>

                                <Table.HeaderCell className='Time--table-footer-cell'
                                    key='mobile-footer-all-rows-total'>
                                    <Input className='Time--cell-container Time--cell-container-footer'
                                        value={sumColumnTotals} readOnly disabled />
                                </Table.HeaderCell>

                                <Table.HeaderCell />
                            </Table.Row>
                        </Table.Footer>
                    </Table>
                </div>

                <div className="Time--mobile-fixed-footer">
                    <Button positive icon onClick={showProjectTaskModal}>
                        <Icon name='plus' />
                    </Button>

                    <Button className='Time-save-button' disabled={!enableSaveButton}
                        positive={enableSaveButton} onClick={onClickSaveTimeEntries}>
                        Save
                        </Button>
                    <Loader active={showSavingLoader} inline size='small' />
                </div>

                <Modal className='Time--project-task-modal' size='tiny' open={openAddProjectsModal}
                    onClose={closeProjectTaskModal}>
                    <Modal.Header>
                        Add Project
                        </Modal.Header>
                    <Modal.Content>
                        <Form>
                            <Form.Group inline>
                                <Form.Field>
                                    <label style={{ minWidth: '60px' }}>Client</label>
                                    <Dropdown placeholder='Client' search selection
                                        options={availableClientsProjectsTasks}
                                        value={projectsModalClient ? projectsModalClient.value : ''}
                                        onChange={onChangeProjectsModalClient} />
                                </Form.Field>
                            </Form.Group>
                            <Form.Group inline>
                                <Form.Field>
                                    <label style={{ minWidth: '60px' }}>Project</label>
                                    <Dropdown placeholder='Project' search selection
                                        options={projectsModalClient ? projectsModalClient.projects : []}
                                        value={projectsModalProject ? projectsModalProject.value : ''}
                                        onChange={onChangeProjectsModalProject} />
                                </Form.Field>
                            </Form.Group>
                            <Form.Group inline>
                                <Form.Field>
                                    <label style={{ minWidth: '60px' }}>Task</label>
                                    <Dropdown placeholder='Task' search selection
                                        options={projectsModalProject ? projectsModalProject.tasks : []}
                                        value={projectsModalTask ? projectsModalTask.value : ''}
                                        onChange={onChangeProjectsModalTask} />
                                </Form.Field>
                            </Form.Group>
                        </Form>

                    </Modal.Content>
                    <Modal.Actions>
                        <Button positive content='Save' onClick={onClickProjectsModalSave} />
                        <Button onClick={closeProjectTaskModal}>Cancel</Button>
                    </Modal.Actions>
                </Modal>
            </div>)
    } else {
        return (
        <div>
            <div className="Time--container">

                <div className='Time--navigation'>
                    <div>
                        <h3>{longFormatter.format(weekStartDate.toDate())} - {longFormatter.format(weekEndDate.toDate())}</h3>
                    </div>
                    <div>
                        <div className='Time--loader-inline'>
                            <Loader inline active={loading} />
                        </div>

                        <Button.Group>
                            <Button icon onClick={onLastWeekClick}>
                                <Icon name='arrow left' />
                            </Button>
                            <Button color='grey' toggle active={!isShowingThisWeek}
                                onClick={onThisWeekClick}>{isShowingThisWeek ? 'This Week' : 'Go to Today'}</Button>
                            <Button icon onClick={onNextWeekClick}>
                                <Icon name='arrow right' />
                            </Button>
                        </Button.Group>
                        <div className='Time--date-picker-container'>
                            <DatePicker
                                selected={weekStartDate.toDate()}
                                onChange={onDatePickerChange}
                                dateFormat={DATE_PICKER_FORMAT}
                                calendarClassName='Time--date-picker'
                                monthsShown={2}
                                customInput={
                                    <Button icon>
                                        <Icon name='calendar' />
                                    </Button>
                                }
                                popperPlacement="left-start"
                            />
                        </div>
                    </div>
                </div>


                <Table unstackable className='Time--table'>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell width={7}>Project/Task</Table.HeaderCell>

                            {headerRowCells}

                            <Table.HeaderCell className='Time--table-header-cell'>Total</Table.HeaderCell>
                            <Table.HeaderCell style={{ width: '50px' }} />
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {projectRowsElements}
                    </Table.Body>

                    <Table.Footer>
                        <Table.Row>
                            <Table.HeaderCell>
                                <Button icon positive onClick={showProjectTaskModal}>
                                    <Icon name='plus' />
                                        Project
                                    </Button>
                                <Button className='Time-save-button' disabled={!enableSaveButton}
                                    positive={enableSaveButton} onClick={onClickSaveTimeEntries}>
                                    Save
                                    </Button>
                                <Loader active={showSavingLoader} inline size='small' />
                            </Table.HeaderCell>

                            {footerRowCells}

                            <Table.HeaderCell />
                        </Table.Row>
                    </Table.Footer>
                </Table>

                <Modal className='Time--project-task-modal' size='tiny' open={openAddProjectsModal}
                    onClose={closeProjectTaskModal}>
                    <Modal.Header>
                        Add Project
                        </Modal.Header>
                    <Modal.Content>
                        <Form>
                            <Form.Group inline>
                                <Form.Field>
                                    <label style={{ minWidth: '60px' }}>Client</label>
                                    <Dropdown placeholder='Client' search selection
                                        options={availableClientsProjectsTasks}
                                        value={projectsModalClient ? projectsModalClient.value : ''}
                                        onChange={onChangeProjectsModalClient} />
                                </Form.Field>
                            </Form.Group>
                            <Form.Group inline>
                                <Form.Field>
                                    <label style={{ minWidth: '60px' }}>Project</label>
                                    <Dropdown placeholder='Project' search selection
                                        options={projectsModalClient ? projectsModalClient.projects : []}
                                        value={projectsModalProject ? projectsModalProject.value : ''}
                                        onChange={onChangeProjectsModalProject} />
                                </Form.Field>
                            </Form.Group>
                            <Form.Group inline>
                                <Form.Field>
                                    <label style={{ minWidth: '60px' }}>Task</label>
                                    <Dropdown placeholder='Task' search selection
                                        options={projectsModalProject ? projectsModalProject.tasks : []}
                                        value={projectsModalTask ? projectsModalTask.value : ''}
                                        onChange={onChangeProjectsModalTask} />
                                </Form.Field>
                            </Form.Group>
                        </Form>

                    </Modal.Content>
                    <Modal.Actions>
                        <Button positive content='Save' onClick={onClickProjectsModalSave} />
                        <Button onClick={closeProjectTaskModal}>Cancel</Button>
                    </Modal.Actions>
                </Modal>
            </div>

            <DeleteProjectTimeRowModal open={openConfirmDeleteProjectRowModal}
                onSuccess={onSuccessDeleteProjectRow}
                onError={onErrorDeleteProjectRow}
                onCancel={onCancelDeleteProjectRow}
                projectId={deleteProjectRowProjectId}
                taskId={deleteProjectRowTaskId}
                startDate={weekStartDate}
                endDate={weekEndDate} />

        </div>)
    }
}

const mapStateToProps = ({ authenticate }) => {
    return {
        authenticated: authenticate.authenticated,
    }
}

const mapDispatchToProps = dispatch => ({
    handleServiceError: (serviceError) => {
        handleServiceError(serviceError, dispatch)
    }
})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TimePage))
