import {
    ADD_ALL_GLOBAL_TASKS,
    ADD_GLOBAL_TASK,
    REMOVE_GLOBAL_TASK,
    UPDATE_GLOBAL_TASK,
    RESET_GLOBAL_TASKS
} from '../action/tasks'
import {compareTasks} from '../components/Util'

const initialState = {
    globalTasks: [],
    globalTasksFetched: false,
}

const tasks = (state = initialState, action) => {
    let updatedGlobalTasks
    switch (action.type) {
        case ADD_ALL_GLOBAL_TASKS:
            if (!action.globalTasks) {
                return state
            }
            action.globalTasks.sort(compareTasks)
            return {
                ...state,
                globalTasksFetched: true,
                globalTasks: [...action.globalTasks],
            }
        case ADD_GLOBAL_TASK:
            if (!action.globalTask) {
                console.error('Add missing task', action)
                return state
            }
            updatedGlobalTasks = [...state.globalTasks, action.globalTask]
            updatedGlobalTasks.sort(compareTasks)
            return {
                ...state,
                globalTasks: updatedGlobalTasks
            }
        case REMOVE_GLOBAL_TASK:
            return {
                ...state,
                globalTasks: state.globalTasks.filter((task) => task.id !== action.taskId),
            }
        case UPDATE_GLOBAL_TASK:
            updatedGlobalTasks = [...state.globalTasks]
            let existingTask = updatedGlobalTasks.find((task) => task.id === action.task.id)
            if (existingTask) {
                Object.assign(existingTask, action.task)
            }

            updatedGlobalTasks.sort(compareTasks)
            return {
                ...state,
                globalTasks: updatedGlobalTasks,
            }
        case RESET_GLOBAL_TASKS:
            return {
                ...state,
                globalTasks: [],
                globalTasksFetched: false,
            }
        default:
            return state
    }
}

export default tasks