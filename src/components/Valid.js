import {EmailMaxLength, EmailMinLength, PasswordMaxLength, PasswordMinLength} from './Constants'
import {
    ClientNameMaxLength,
    ClientNameMinLength,
    CompanyNameMaxLength,
    CompanyNameMinLength, CreditCardNameMaxLength, CreditCardNameMinLength,
    NameMaxLength,
    NameMinLength,
    ProjectNameMaxLength,
    ProjectNameMinLength, TaskNameMaxLength, TaskNameMinLength
} from './Constants'

export function isEmailValid(email) {
    if (!email
        || email.length < EmailMinLength
        || email.indexOf('.') === -1
        || email.indexOf('@') === -1
        || email.length > EmailMaxLength) {
        return false
    }

    return true
}

export function isPasswordValid(password) {
    if (!password
        || password.length < PasswordMinLength
        || password.length > PasswordMaxLength) {
        return false
    }

    return true
}

export function isNameValid(name) {
    if (!name
        || !name.trim()
        || name.length < NameMinLength
        || name.length > NameMaxLength) {
        return false
    }

    return true
}

export function isCreditCardFullNameValid(name) {
    if (!name
        || !name.trim()
        || name.length < CreditCardNameMinLength
        || name.length > CreditCardNameMaxLength) {
        return false
    }

    return true
}

export function isCompanyValid(company) {
    if (!company
        || company.length < CompanyNameMinLength
        || company.length > CompanyNameMaxLength) {
        return false
    }

    return true
}

export function isProjectNameValid(projectName) {
    if (!projectName
        || projectName.trim().length === 0
        || projectName.length < ProjectNameMinLength
        || projectName.length > ProjectNameMaxLength) {
        return false
    }

    return true
}

export function isClientNameValid(clientName) {
    if (!clientName
        || clientName.trim().length === 0
        || clientName.length < ClientNameMinLength
        || clientName.length > ClientNameMaxLength) {
        return false
    }

    return true
}

export function isTaskNameValid(taskName) {
    if (!taskName
        || taskName.trim().length === 0
        || taskName.length < TaskNameMinLength
        || taskName.length > TaskNameMaxLength) {
        return false
    }

    return true
}
