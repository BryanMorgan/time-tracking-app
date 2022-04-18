import ServiceError from '../error/ServiceError'
import {fetchApi} from './service'

export const loginApi = async (email, password) => {
    let loginRequest = {
        email: email,
        password: password,
    }

    return await fetchApi('/api/auth/login', loginRequest)
}

export const createAccountApi = async ({firstName, lastName, company, email, password}) => {
    let createAccountRequest = {
        firstName,
        lastName,
        company,
        email,
        password,
    }

    return await fetchApi('/api/account', createAccountRequest)
}

export const setupNewUserAccount = async (token, password) => {
    let setupNewUserRequest = {
        token,
        password,
    }

    return await fetchApi('/api/auth/setup', setupNewUserRequest, 'put')
}

export const tokenApi = async () => {
    let response, json

    try {
        let request = new Request(import.meta.env.VITE_REACT_APP_API_URL + '/api/auth/token', {
            method: 'post',
            // mode: 'same-origin',
            // credentials: 'same-origin',
            cache: 'no-store',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        });

        response = await fetch(request)
    } catch (err) {
        console.error(err)
        throw new ServiceError({code: 'FETCH_FAILED', errorMessage: err.message, message: err.message}, 500)
    }

    let contentType = response.headers.get("content-type")
    if (contentType.indexOf("application/json") === -1) {
        throw new ServiceError({code: 'INVALID_CONTENT_TYPE', message: 'Invalid content type: ' + contentType}, 500)
    }

    try {
        json = await response.json()
    } catch (err) {
        throw new ServiceError({code: 'INVALID_JSON_RESPONSE', errorMessage: err.message, message: err.message}, 500)
    }

    if (response.status !== 200 || json.status === 'error') {
        throw new ServiceError(json, response.status)
    }

    return json.data
}

export const logoutApi = async () => {
    let response, json

    try {
        let request = new Request(import.meta.env.VITE_REACT_APP_API_URL + '/api/auth/logout', {
            method: 'post',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        });

        response = await fetch(request)
    } catch (err) {
        throw new ServiceError({code: 'FETCH_FAILED', errorMessage: err.message, message: err.message}, 500)
    }

    let contentType = response.headers.get("content-type")
    if (contentType.indexOf("application/json") === -1) {
        throw new ServiceError({code: 'INVALID_CONTENT_TYPE', message: 'Invalid content type: ' + contentType}, 500)
    }

    try {
        json = await response.json()
    } catch (err) {
        throw new ServiceError({code: 'INVALID_JSON_RESPONSE', errorMessage: err.message, message: err.message}, 500)
    }

    if (response.status !== 200) {
        throw new ServiceError(json, response.status)
    }

    return json
}


