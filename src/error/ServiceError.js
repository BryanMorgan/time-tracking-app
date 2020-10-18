class ServiceError extends Error {
    constructor(data = {}, statusCode = 0, ...params) {
        super(...params)

        this.errorCode = data.code
        this.statusCode = statusCode
        this.message = data.message
        this.errorMessage = data.error
        this.errorActionMessage = data.errorActionMessage
        this.detail = data.detail ? data.detail : {}
    }
}

export default ServiceError