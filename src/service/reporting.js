import { fetchCsvApi, getApi } from './service'
import { getShortDateString } from '../components/Util'

export const getClientsReportApi = async (from, to, page) => {
    from = getShortDateString(from) || ''
    to = getShortDateString(to) || ''
    page = page || ''
    const url = `/api/report/time/client?from=${from}&to=${to}&page=${page}`

    return await getApi(url)
}

export const getProjectsReportApi = async (from, to, page) => {
    from = getShortDateString(from) || ''
    to = getShortDateString(to) || ''
    page = page || ''
    const url = `/api/report/time/project?from=${from}&to=${to}&page=${page}`

    return await getApi(url)
}

export const getTasksReportApi = async (from, to, page) => {
    from = getShortDateString(from) || ''
    to = getShortDateString(to) || ''
    page = page || ''
    const url = `/api/report/time/task?from=${from}&to=${to}&page=${page}`

    return await getApi(url)
}

export const getPersonReportApi = async (from, to, page) => {
    from = getShortDateString(from) || ''
    to = getShortDateString(to) || ''
    page = page || ''
    const url = `/api/report/time/person?from=${from}&to=${to}&page=${page}`

    return await getApi(url)
}

export const exportClientToCsvApi = async (key, from, to) => {
    let apiPath = 'client'
    switch (key) {
        case 'projects':
            apiPath = 'project'
            break;
        case 'tasks':
            apiPath = 'task'
            break;
        case 'person':
            apiPath = 'person'
            break;
        default:
            apiPath = 'client'
    }
    from = getShortDateString(from) || ''
    to = getShortDateString(to) || ''
    const url = `/api/report/time/export/${apiPath}?from=${from}&to=${to}`
    
    return await fetchCsvApi(url)
}
