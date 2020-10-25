import dayjs from 'dayjs'
import {showServerErrorModal, showSessionExpiredModal} from '../action/authenticate'

export const SHORT_DATE_FORMAT = 'YYYY-MM-DD'
export const DATE_PICKER_FORMAT = 'yyyy-MM-dd'

export const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
});

export const numericFormatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
});

/**
 * Parses an id of the form {projectId_taskId_date} into a object of the form:
 * {
 *   projectId: {projectId},
 *   taskId:    {taskId},
 *   date:      {date}
 * }
 * where the date part of the id is optional
 */
export function parseProjectTaskDateId(projectTaskDateId) {
    let result = {}

    if (projectTaskDateId) {
        let values = projectTaskDateId.split('_')
        if (values.length >= 2) {
            result.projectId = parseInt(values[0], 10)
            result.taskId = parseInt(values[1], 10)
        }

        if (values.length >= 3) {
            result.date = values[2]
        }
    }

    return result
}

export function createProjectTaskDateId(projectId, taskId, date) {
    let id = projectId + '_' + taskId
    if (date) {
        id = id + '_' + date
    }

    return id
}

export function getShortDateString(date) {
    if (!date) {
        return ''
    }

    if (!(date instanceof dayjs)) {
        date = dayjs(date)
    }

    return date.format(SHORT_DATE_FORMAT)
}

export function isDateFormatValid(dateString) {
    if (!dateString) {
        return false
    }

    let date = dayjs(dateString, SHORT_DATE_FORMAT)

    if (!date.isValid()) {
        return false
    }

    return true
}

export function ensureValidId(id) {
    if (typeof id === 'string') {
        return id.replace(/[^0-9.]/g, '')
    }

    if (typeof id === 'number') {
        return parseInt(id, 10)
    }

    console.error('Invalid id', id)

    return 'invalid_id'
}

export function convertRateStringToFloat(rateString) {
    let rateFloat = parseFloat(rateString)
    if (isNaN(rateFloat) || rateFloat < 0.0) {
        rateFloat = 0.0
    }
    return rateFloat
}

export function convertStringToId(stringId) {
    if (stringId === undefined || stringId === null) {
        return null
    }
    return parseInt(stringId, 10)
}

// Sort Projects
export function compareProjects(projectA, projectB) {
    const projectNameA = projectA.projectName.toLowerCase()
    const projectNameB = projectB.projectName.toLowerCase()
    const clientNameA = projectA.clientName.toLowerCase()
    const clientNameB = projectB.clientName.toLowerCase()
    const taskNameA = projectA.taskName.toLowerCase()
    const taskNameB = projectB.taskName.toLowerCase()

    const fullNameA = projectNameA + clientNameA + taskNameA
    const fullNameB = projectNameB + clientNameB + taskNameB

    if (fullNameA > fullNameB) {
        return 1
    } else if (fullNameA < fullNameB) {
        return -1
    }

    return 0
}

// Sort Tasks
export function compareTasks(taskA, taskB) {
    if (taskA.name === null || taskA.name === undefined ||
        taskB.name === null || taskB.name === undefined) {
        return 0
    }

    const taskNameA = taskA.name.toLowerCase()
    const taskNameB = taskB.name.toLowerCase()

    if (taskNameA > taskNameB) {
        return 1
    } else if (taskNameA < taskNameB) {
        return -1
    }

    return 0
}


export function handleServiceError(serviceError, dispatch) {
    if (typeof dispatch !== 'function') {
        console.error('Invalid dispatch parameter', dispatch)
        return
    }

    const sessionErrorCodes = ['MissingToken', 'TokenExpired', 'InvalidToken', 'ProfileNotFound']
    if (sessionErrorCodes.includes(serviceError.errorCode)) {
        dispatch(showSessionExpiredModal())
    } else {
        serviceError.errorMessage = 'Something went wrong with your request'
        dispatch(showServerErrorModal(serviceError))
    }
}
