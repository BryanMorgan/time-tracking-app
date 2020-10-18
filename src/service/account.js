import {fetchApi, getApi} from './service'

export const getAccountApi = async () => {
    return await getApi('/api/account')
}

export const getAllAccountsApi = async () => {
    return await getApi('/api/account/all')
}

export const updateAccountApi = async ({companyName, weekStart, timezone}) => {
    let request = {
        company: companyName,
        timezone,
        weekStart,
    }

    return await fetchApi('/api/account', request, 'put')
}

export const addUserApi = async ({firstName, lastName, email, role}) => {
    let addUserRequest = {
        firstName,
        lastName,
        email,
        role,
    }

    return await fetchApi('/api/account/user', addUserRequest, 'post')
}
