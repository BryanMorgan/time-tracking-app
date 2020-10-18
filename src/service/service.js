import ServiceError from '../error/ServiceError'

export const getApi = async (url) => {
    return await fetchApi(url, null, 'get')
}

export const fetchApi = async (url, body, method = 'post') => {
    let response, json

    try {
        let request = {
            method: method,
            cache: 'no-store',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        }

        if (body) {
            request.body = JSON.stringify(body)
        }

        response = await fetch(process.env.REACT_APP_API_URL + url, request)
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

    if (response.status !== 200 || json.status === 'error') {
        throw new ServiceError(json, response.status)
    }

    return json.data
}

export const fetchCsvApi = async (url) => {
    let response

    try {
        let request = {
            method: 'get',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'text/csv'
            })
        }

        response = await fetch(process.env.REACT_APP_API_URL + url, request)
    } catch (err) {
        throw new ServiceError({code: 'FETCH_FAILED', errorMessage: err.message, message: err.message}, 500)
    }

    let contentType = response.headers.get("content-type")
    if (contentType.indexOf("text/csv") === -1) {
        throw new ServiceError({code: 'INVALID_CONTENT_TYPE', message: 'Invalid content type: ' + contentType}, 500)
    }

    if (response.status !== 200) {
        throw new ServiceError({
            errorCode: response.status,
            statusCode: response.status,
            message: "Failed to download CSV"
        }, response.status)
    }

    return response.blob()
}

