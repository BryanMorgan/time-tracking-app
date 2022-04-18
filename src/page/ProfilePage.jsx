import React, { useState, useEffect, Component } from 'react';

import { connect } from 'react-redux'
import { Button, Dimmer, Dropdown, Form, Header, Icon, Loader, Popup, Segment } from 'semantic-ui-react'
import { getProfileApi, updatePasswordApi, updateProfileApi } from '../service/profile'
import {
    EmailMaxLength,
    NameMaxLength,
    PasswordMaxLength,
    PasswordMinLength,
    timezoneList
} from '../components/Constants'
import { isEmailValid, isNameValid, isPasswordValid } from '../components/Valid'
import { updateProfileSuccessful } from '../action/authenticate'
import { handleServiceError } from '../components/Util'

const requiredAction = { content: 'Required', disabled: true, color: 'red' }
const mismatchPasswordAction = { content: 'Does Not Match', disabled: true, color: 'red' }
const invalidPasswordAction = { content: 'Incorrect Password', disabled: true, color: 'red' }
const emailErrorAction = { content: 'Error', disabled: true, color: 'red' }

const ProfilePage = (props) => {

    const [loading, setLoading] = useState(false)
    const [firstNameError, setFirstNameError] = useState(false)
    const [lastNameError, setLastNameError] = useState(false)
    const [emailError, setEmailError] = useState(false)
    const [emailActionMessage, setEmailActionMessage] = useState(false)
    const [oldPasswordError, setOldPasswordError] = useState(false)
    const [passwordError, setPasswordError] = useState(false)
    const [passwordInvalidError, setPasswordInvalidError] = useState(false)
    const [confirmPasswordError, setConfirmPasswordError] = useState(false)
    const [confirmPasswordMismatchError, setConfirmPasswordMismatchError] = useState(false)
    const [profile, setProfileState] = useState({
        firstName: '',
        lastName: '',
        email: '',
        timezone: '',
        oldPassword: '',
        password: '',
        confirmPassword: '',
        showPasswordHint: false,
    })

    useEffect(() => {
        setLoading(true)

        getProfileApi()
            .then(json => {
                setProfileState({
                    ...profile,
                    firstName: json.firstName,
                    lastName: json.lastName,
                    email: json.email,
                    timezone: json.timezone,
                });
            })
            .catch(serviceError => {
                console.error(serviceError)
                props.handleServiceError(serviceError)
            })
            .finally(() => {
                setLoading(false);
            })
    }, [])

    function handleProfileSubmit(e) {
        e.preventDefault();

        const { email, firstName, lastName, timezone } = profile

        if (!isNameValid(firstName)) {
            return setFirstNameError(true)
        }

        if (!isNameValid(lastName)) {
            return setLastNameError(true)
        }

        if (!isEmailValid(email)) {
            setEmailError(true)
            setEmailActionMessage('Required')
            return
        }

        setLoading(true)

        updateProfileApi({ firstName, lastName, email, timezone })
            .then(json => {
                props.updateProfileSuccessful(json)
            })
            .catch(serviceError => {
                if (serviceError.errorCode === 'AccountExists') {
                    setEmailError(true)
                    setEmailActionMessage('Email in use')
                } else {
                    props.handleServiceError(serviceError)
                }
            })
            .finally(() => {
                setLoading(false)
            })
    }

    function handlePasswordSubmit(e) {
        e.preventDefault();

        const { oldPassword, password, confirmPassword } = profile

        if (!isPasswordValid(oldPassword)) {
            return setOldPasswordError(true)
        }

        if (!isPasswordValid(password)) {
            return setPasswordError(true)
        }

        if (!isPasswordValid(confirmPassword)) {
            return setConfirmPasswordError(true)
        }

        if (password !== confirmPassword) {
            return setConfirmPasswordMismatchError(true)
        }

        setLoading(true)

        updatePasswordApi({ oldPassword, password, confirmPassword })
            .then(json => {
                setLoading(false)
            })
            .catch(serviceError => {
                if (serviceError.errorCode === 'InvalidPassword') {
                    setPasswordInvalidError(true)
                } else if (serviceError.errorCode === 'FieldSize') {
                    if (serviceError.detail && serviceError.detail.field) {
                        if (serviceError.detail.field === 'currentPassword') {
                            setOldPasswordError(true)
                        } else if (serviceError.detail.field === 'password') {
                            setPasswordError(true)
                        } else if (serviceError.detail.field === 'confirmPassword') {
                            setConfirmPasswordError(true)
                        }
                    }
                } else if (serviceError.errorCode === 'PasswordMismatch') {
                    setConfirmPasswordMismatchError(true)
                } else {
                    props.handleServiceError(serviceError)
                }
                setLoading(false)
            })
    }

    function onChange(e) {
        let { name, value } = e.target;
        if (name === 'email' && value) {
            value = value.toLowerCase()
        }

        setProfileState({
            ...profile,
            [name]: value,
            firstNameError: false,
            lastNameError: false,
            emailError: false,
            emailActionMessage: '',
        })
    }

    function onPasswordChange(e) {
        let { name, value } = e.target;

        setProfileState({
            ...profile,
            [name]: value,
            oldPasswordError: false,
            passwordError: false,
            passwordInvalidError: false,
            confirmPasswordError: false,
            confirmPasswordMismatchError: false,
        })

    }

    function onPasswordFocus() {
        setProfileState({
            ...profile,
            showPasswordHint: true
        })
    }

    function onPasswordBlur() {
        setProfileState({
            ...profile,
            showPasswordHint: false
        })
    }

    function onTimezoneChange(e, data) {
        setProfileState({
            ...profile,
            timezone: data.value
        })
    }

    const { firstName, lastName, email, timezone, oldPassword, password, confirmPassword, showPasswordHint } = profile

    if (emailError) {
        emailErrorAction.content = emailActionMessage
    }

    if (loading) {
        return (
            <Dimmer active={loading} inverted>
                <Loader size='large'>Loading your profile...</Loader>
            </Dimmer>
        )
    }

    return (
        <div className="MyProfile-container">
            <Header as='h2' icon textAlign='center'>
                <Icon name='user' circular />
                <Header.Content>
                    My Profile
                    </Header.Content>
            </Header>
            <Segment raised>
                <Form onSubmit={handleProfileSubmit}>
                    <Form.Input fluid icon='address card outline' iconPosition='left'
                        label='First Name' labelPosition='left' type='text' name='firstName'
                        value={firstName} onChange={onChange} error={firstNameError}
                        maxLength={NameMaxLength} autoFocus
                        action={firstNameError ? requiredAction : null}
                        autoComplete="given-name"
                    />

                    <Form.Input fluid icon='address card outline' iconPosition='left'
                        label='Last Name' labelPosition='left' type='text' name='lastName'
                        value={lastName} onChange={onChange} error={lastNameError}
                        maxLength={NameMaxLength} action={lastNameError ? requiredAction : null}
                        autoComplete="family-name"
                    />

                    <Form.Input fluid icon='user' iconPosition='left'
                        label='Email' labelPosition='left' type='email' name='email'
                        value={email} onChange={onChange} error={emailError}
                        maxLength={EmailMaxLength} action={emailError ? emailErrorAction : null}
                        autoComplete="email"
                    />

                    <Form.Field>
                        <label>Timezone</label>
                        <Dropdown placeholder='Timezone' search selection options={timezoneList} name='timezone'
                            onChange={onTimezoneChange} defaultValue={timezone} />
                    </Form.Field>
                    <Button primary type='submit'>Update Profile</Button>
                </Form>
            </Segment>

            <Header as='h4' icon textAlign='center'>
                <Icon name='lock' />
                <Header.Content>
                    Change Password
                    </Header.Content>
            </Header>

            <Segment raised>
                <Form onSubmit={handlePasswordSubmit}>
                    <Form.Input fluid icon='lock' iconPosition='left'
                        label='Old Password' labelPosition='left'
                        type='password' name='oldPassword' value={oldPassword}
                        onChange={onPasswordChange} error={oldPasswordError || passwordInvalidError}
                        maxLength={PasswordMaxLength}
                        action={passwordInvalidError ? invalidPasswordAction : oldPasswordError ? requiredAction : null}
                        autoComplete="current-password"
                    />
                    <Popup
                        trigger={
                            <Form.Input fluid icon='lock' iconPosition='left'
                                label='Password' labelPosition='left'
                                type='password' name='password' value={password}
                                onFocus={onPasswordFocus} onBlur={onPasswordBlur}
                                onChange={onPasswordChange} error={passwordError}
                                maxLength={PasswordMaxLength}
                                action={passwordError ? requiredAction : null}
                                autoComplete="new-password"
                            />
                        }
                        on='focus'
                        open={showPasswordHint && password.length > 0 && password.length < PasswordMinLength}
                        content='Password should be at least 8 characters'
                        position='right center'
                    />

                    <Form.Input fluid icon='lock' iconPosition='left'
                        label='Confirm Password' labelPosition='left'
                        type='password' name='confirmPassword' value={confirmPassword}
                        onChange={onPasswordChange} error={confirmPasswordError || confirmPasswordMismatchError}
                        maxLength={PasswordMaxLength}
                        action={confirmPasswordMismatchError ? mismatchPasswordAction : confirmPasswordError ? requiredAction : null}
                        autoComplete="new-password"
                    />

                    <Button primary type='submit'>Update Password</Button>
                </Form>
            </Segment>
        </div>

    );
}

const mapStateToProps = ({ authenticate }) => ({
    authenticated: authenticate.authenticated
})

const mapDispatchToProps = dispatch => ({
    handleServiceError: (serviceError) => {
        handleServiceError(serviceError, dispatch)
    },

    updateProfileSuccessful: (json) => {
        dispatch(updateProfileSuccessful(json))
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(ProfilePage)

