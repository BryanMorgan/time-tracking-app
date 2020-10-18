export const ADD_ALL_GLOBAL_TASKS = 'ADD_ALL_GLOBAL_TASKS'
export const ADD_GLOBAL_TASK = 'ADD_GLOBAL_TASK'
export const REMOVE_GLOBAL_TASK = 'REMOVE_GLOBAL_TASK'
export const UPDATE_GLOBAL_TASK = 'UPDATE_GLOBAL_TASK'
export const RESET_GLOBAL_TASKS = 'RESET_GLOBAL_TASKS'

export const addAllGlobalTasks = globalTasks => ({
    type: ADD_ALL_GLOBAL_TASKS,
    globalTasks,
})

export const addGlobalTask = globalTask => ({
    type: ADD_GLOBAL_TASK,
    globalTask,
})

export const removeGlobalTask = taskId => ({
    type: REMOVE_GLOBAL_TASK,
    taskId,
})

export const updateGlobalTask = task => ({
    type: UPDATE_GLOBAL_TASK,
    task,
})

export const resetGlobalTasks = () => ({
    type: RESET_GLOBAL_TASKS,
})
