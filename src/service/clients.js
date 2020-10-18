import {fetchApi, getApi} from './service'
import {ensureValidId, getShortDateString} from '../components/Util'

// ---- Client API ----

export const getClientApi = async (clientId) => {
    return await getApi('/api/client/' + ensureValidId(clientId))
}

export const getAllClientsApi = async () => {
    return await getApi('/api/client/all')
}

export const getArchivedClientsApi = async () => {
    return await getApi('/api/client/archived')
}

export const archiveClientApi = async (clientId) => {
    let request = {
        id: ensureValidId(clientId),
    }

    return await fetchApi('/api/client/archive', request, 'put')
}

export const restoreArchivedClientsApi = async (clientId) => {
    let request = {
        id: ensureValidId(clientId),
    }

    return await fetchApi('/api/client/restore', request, 'put')
}

export const createClientApi = async (client) => {
    return await fetchApi('/api/client', client, 'post')
}

export const updateClientApi = async (client) => {
    return await fetchApi('/api/client', client, 'put')
}


// ---- Project API ----

export const getProjectApi = async (projectId) => {
    return await getApi('/api/client/project/' + ensureValidId(projectId))
}

export const getAllProjectsApi = async () => {
    return await getApi('/api/client/project/all')
}

export const getArchivedProjectsApi = async () => {
    return await getApi('/api/client/project/archived')
}

export const archiveProjectApi = async (projectId) => {
    let request = {
        projectId: ensureValidId(projectId),
    }

    return await fetchApi('/api/client/project/archive', request, 'put')
}

export const restoreArchivedProjectsApi = async (projectId) => {
    let request = {
        projectId: ensureValidId(projectId),
    }

    return await fetchApi('/api/client/project/restore', request, 'put')
}

export const createProjectApi = async (project, tasks) => {
    let request = {
        name: project.name,
        clientId: project.clientId,
        tasks,
    }

    return await fetchApi('/api/client/project', request, 'post')
}

export const updateProjectApi = async (project, tasks) => {
    let request = {
        id: project.id,
        name: project.name,
        clientId: project.clientId,
        tasks,
    }

    return await fetchApi('/api/client/project', request, 'put')
}

export const copyProjectsFromPriorWeekApi = async (startDate, endDate) => {
    const request = {
        startDate: getShortDateString(startDate),
        endDate: getShortDateString(endDate),
    }
    return await fetchApi('/api/client/project/copy/last/week', request, 'post')
}


// ---- Task API ----

export const getAllGlobalTasksApi = async () => {
    return await getApi('/api/task/all')
}

export const getTaskApi = async (taskId) => {
    return await getApi('/api/task/' + ensureValidId(taskId))
}

export const getAllGlobalArchivedTasksApi = async () => {
    return await getApi('/api/task/archived')
}

export const archiveTaskApi = async (taskId) => {
    let request = {
        id: ensureValidId(taskId),
    }

    return await fetchApi('/api/task/archive', request, 'put')
}

export const restoreArchivedTaskApi = async (taskId) => {
    let request = {
        id: ensureValidId(taskId),
    }

    return await fetchApi('/api/task/restore', request, 'put')
}

export const createTaskApi = async (task) => {
    return await fetchApi('/api/task', task, 'post')
}

export const updateTaskApi = async (task) => {
    return await fetchApi('/api/task', task, 'put')
}

