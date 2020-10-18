import {
    CREATE_ACCOUNT_SUCCESSFUL,
    LOGIN_SUCCESSFUL,
    LOGOUT,
    REQUEST_LOGIN,
    REQUEST_TOKEN,
    TOKEN_INVALID,
    UNAUTHORIZED, UPDATE_PROFILE_SUCCESSFUL,
    UPDATE_ACCOUNT_SUCCESSFUL, CLOSE_ERROR_MODAL, SHOW_SERVER_ERROR_MODAL, SHOW_SESSION_EXPIRED_MODAL
} from '../action/authenticate'

const clearProfile = {
    userId: null,
    firstName: null,
    lastName: null,
    company: null,
    email: null,
    timezone: null,
    multipleAccounts: false,
    weekStart: 0,
}

const clearErrorState = {
    serverError: false,
    serverErrorMessage: '',
    serverErrorActionMessage: '',
    serverErrorTitle: '',
    sessionExpiredError: false,
}

const initialState = {
    authenticated: false,
    ...clearErrorState,
    ...clearProfile,
}


const authenticate = (state = initialState, action) => {
    switch (action.type) {
        case REQUEST_LOGIN:
            return {
                ...state,
            }
        case LOGIN_SUCCESSFUL:
            return {
                ...state,
                authenticated: true,
                userId: action.userId,
                firstName: action.firstName,
                lastName: action.lastName,
                company: action.company,
                multipleAccounts: action.multipleAccounts,
                weekStart: action.weekStart,
            }
        case CREATE_ACCOUNT_SUCCESSFUL:
            return {
                ...state,
                authenticated: true,
                userId: action.userId,
                firstName: action.firstName,
                lastName: action.lastName,
                company: action.company,
                multipleAccounts: action.multipleAccounts,
                weekStart: action.weekStart,
            }
        case REQUEST_TOKEN:
            return {
                ...state,
            }
        case TOKEN_INVALID:
            return {
                ...state,
                authenticated: false,
                ...clearProfile,
            }
        case UNAUTHORIZED:
            return {
                ...state,
                authenticated: false,
                ...clearProfile,
            }
        case LOGOUT:
            return {
                ...state,
                authenticated: false,
                ...clearProfile,
            }
        case UPDATE_PROFILE_SUCCESSFUL:
            return {
                ...state,
                firstName: action.firstName,
                lastName: action.lastName,
                email: action.email,
                timezone: action.timezone,
            }
        case UPDATE_ACCOUNT_SUCCESSFUL:
            return {
                ...state,
                company: action.company,
                weekStart: action.weekStart,
            }
        case CLOSE_ERROR_MODAL:
            return {
                ...state,
                ...clearErrorState,
            }
        case SHOW_SERVER_ERROR_MODAL:
            return {
                ...state,
                serverError: true,
                serverErrorMessage: action.message,
                serverErrorActionMessage: action.actionMessage,
                serverErrorTitle: action.title,
            }
        case SHOW_SESSION_EXPIRED_MODAL:
            return {
                ...state,
                sessionExpiredError: true,
            }
        default:
            return state
    }
}


export default authenticate