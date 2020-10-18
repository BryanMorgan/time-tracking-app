export const REQUEST_LOGIN = 'REQUEST_LOGIN'
export const LOGIN_SUCCESSFUL = 'LOGIN_SUCCESSFUL'
export const CREATE_ACCOUNT_SUCCESSFUL = 'CREATE_ACCOUNT_SUCCESSFUL'
export const REQUEST_TOKEN = 'REQUEST_TOKEN'
export const TOKEN_INVALID = 'TOKEN_INVALID'
export const UNAUTHORIZED = 'UNAUTHORIZED'
export const LOGOUT = 'LOGOUT'
export const UPDATE_PROFILE_SUCCESSFUL = 'UPDATE_PROFILE_SUCCESSFUL'
export const UPDATE_ACCOUNT_SUCCESSFUL = 'UPDATE_ACCOUNT_SUCCESSFUL'
export const CLOSE_ERROR_MODAL = 'CLOSE_ERROR_MODAL'
export const SHOW_SESSION_EXPIRED_MODAL = 'SHOW_SESSION_EXPIRED_MODAL'
export const SHOW_SERVER_ERROR_MODAL = 'SHOW_SERVER_ERROR_MODAL'

export const requestLogin = () => ({
    type: REQUEST_LOGIN,
    authenticated: false,
})

export const loginSuccessful = json => ({
    type: LOGIN_SUCCESSFUL,
    userId: json.id,
    firstName: json.firstName,
    lastName: json.lastName,
    company: json.company,
    weekStart: json.weekStart,
    multipleAccounts: json.multipleAccounts,
})

export const createAccountSuccessful = json => ({
    type: CREATE_ACCOUNT_SUCCESSFUL,
    userId: json.id,
    firstName: json.firstName,
    lastName: json.lastName,
    company: json.company,
    multipleAccounts: json.multipleAccounts,
})


export const tokenInvalid = (serviceError = {}) => ({
    type: TOKEN_INVALID,
    errorCode: serviceError.errorCode,
    statusCode: serviceError.statusCode,
    errorMessage: serviceError.errorMessage,
    message: serviceError.message
})

export const logoutAction = json => ({
    type: LOGOUT,
})

export const updateProfileSuccessful = json => ({
    type: UPDATE_PROFILE_SUCCESSFUL,
    firstName: json.firstName,
    lastName: json.lastName,
    email: json.email,
    timezone: json.timezone,
})


export const updateAccountSuccessful = json => ({
    type: UPDATE_ACCOUNT_SUCCESSFUL,
    company: json.company,
    weekStart: json.weekStart,
})

export const closeErrorModal = () => ({
    type: CLOSE_ERROR_MODAL,
})

export const showServerErrorModal = (serviceError = {}) => ({
    type: SHOW_SERVER_ERROR_MODAL,
    message: serviceError.message,
    actionMessage: serviceError.actionMessage,
    title: serviceError.title,
})

export const showSessionExpiredModal = () => ({
    type: SHOW_SESSION_EXPIRED_MODAL,
})

