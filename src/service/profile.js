import {fetchApi, getApi} from './service'

export const getProfileApi = async () => {
    return await getApi('/api/profile')
}

export const updateProfileApi = async ({firstName, lastName, email, timezone}) => {
    let updateProfileRequest = {
        firstName,
        lastName,
        email,
        timezone,
    }

    return await fetchApi('/api/profile', updateProfileRequest, 'put')
}

export const updatePasswordApi = async ({oldPassword, password, confirmPassword}) => {
    let updatePasswordRequest = {
        currentPassword: oldPassword,
        password,
        confirmPassword,
    }

    return await fetchApi('/api/profile/password', updatePasswordRequest, 'put')
}

