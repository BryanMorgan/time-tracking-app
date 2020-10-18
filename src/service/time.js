import {getApi, fetchApi} from './service'

import {getShortDateString, parseProjectTaskDateId} from '../components/Util'

export const getTimeWeekApi = async (startDay) => {
    if (startDay) {
        return await getApi('/api/time/week/' + startDay)
    }
    return await getApi('/api/time/week')
}

export const getProjectsAndTasksApi = async () => {
    return await getApi('/api/client/project/all')
}

export const addProjectRowApi = async (startDate, endDate, project, task) => {
    const addProjectRowRequest = {
        startDate: getShortDateString(startDate),
        endDate: getShortDateString(endDate),
        projectId: project.id,
        taskId: task.id,
    }

    return await fetchApi('/api/time/project/week', addProjectRowRequest)
}

export const deleteProjectRowApi = async (startDate, endDate, projectId, taskId) => {
    const deleteProjectRowRequest = {
        startDate: getShortDateString(startDate),
        endDate: getShortDateString(endDate),
        projectId,
        taskId,
    }

    return await fetchApi('/api/time/project/week', deleteProjectRowRequest, 'delete')
}

export const saveTimeChangesApi = async (projectTimeEntryChanges) => {
    let updatedEntries = []
    for (let [id, hours] of Object.entries(projectTimeEntryChanges)) {
        let values = parseProjectTaskDateId(id)
        if (values.projectId && values.taskId && values.date) {
            updatedEntries.push({
                projectId: values.projectId,
                taskId: values.taskId,
                day: values.date,
                hours: parseFloat(hours),
            })
        } else {
            console.error('Invalid project/task/date id: ' + id)
        }
    }

    const updateTimeEntriesRequest = {
        entries: updatedEntries,
    }

    return await fetchApi('/api/time', updateTimeEntriesRequest, 'put')
}

