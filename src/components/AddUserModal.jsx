import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Button, Dimmer, Form, Icon, Loader, Message, Modal } from 'semantic-ui-react';
import { addUserApi } from '../service/account';
import { EmailMaxLength, EmailMinLength, NameMaxLength, NameMinLength } from './Constants';
import { handleServiceError } from './Util';
import { isEmailValid, isNameValid } from './Valid';

const ROLE_USER = 'user'
const ROLE_ADMIN = 'admin'

const requiredAction = { content: 'Required', disabled: true, color: 'red' }

const AddUserModal = (props) => {
    const [loading, setLoading] = useState(false)
    const [errorCode, setErrorCode] = useState('')
    const [errorField, setErrorField] = useState('')
    const [firstNameError, setFirstNameError] = useState(false)
    const [lastNameError, setLastNameError] = useState(false)
    const [emailError, setEmailError] = useState(false)
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        email: '',
        role: ROLE_USER,
    })

    function setDefaultState() {
        setErrorField('')
        setErrorCode('')
        setFirstNameError(false)
        setLastNameError(false)
        setEmailError(false)
        setProfile({
            firstName: '',
            lastName: '',
            email: '',
            role: ROLE_USER,
        })
    }

    function messageForErrorCode(code, field) {
        switch (code) {
            case 'AccountExists':
                return 'An account already exists for that email.'
            case 'EmailExistsInAccount':
                return 'This email address is already being used in this account'
            case 'InvalidEmail':
                return 'Email isn\'t in a valid format'
            case 'FieldSize':
                if (field === 'email') {
                    return 'Email length must be ' + EmailMinLength + ' to ' + EmailMaxLength + ' characters'
                } else if (field === 'firstName') {
                    return 'First name length must be ' + NameMinLength + ' to ' + NameMaxLength + ' characters'
                } else if (field === 'lastName') {
                    return 'Last name length must be ' + NameMinLength + ' to ' + NameMaxLength + ' characters'
                }

                return 'Invalid field size. Please check values.'
            case 'FETCH_FAILED':
                return 'You might be offline. Please try again when you\'re connected to the internet.'
            default:
                return 'Unable to add user to account'
        }
    }

    function onChange(e) {
        const { name, value } = e.target;
        setProfile({
            ...profile,
            [name]: value,
        })
        setErrorField('')
        setErrorCode('')
        setFirstNameError(false)
        setLastNameError(false)
        setEmailError(false)
    }

    function onClickAddUser ()  {
        let {firstName, lastName, email, role} = profile

        if (!isNameValid(firstName)) {
            return setFirstNameError(true)
        }

        if (!isNameValid(lastName)) {
            return setLastNameError(true)
        }

        if (!isEmailValid(email)) {
            return setEmailError(true)
        }

        setLoading(true)
        addUserApi({
            firstName: firstName,
            lastName: lastName,
            email: email,
            role: role,
        }).then(json => {
            props.onSuccess(json)
            setDefaultState()
        }).catch(serviceError => {
            let errorCode = serviceError.errorCode
            let errorField = serviceError.detail.field

            setErrorCode(errorCode)
            setErrorField(errorField)

            console.error("Service Error", serviceError)

            if (errorCode !== 'EmailExistsInAccount'
                && errorCode !== 'AccountExists'
                && errorCode !== 'InvalidEmail'
                && errorCode !== 'FieldSize') {
                props.handleServiceError(serviceError)
            }
        }).finally(() => setLoading(false))
    }

    function onClickCancel  ()  {
        props.onCancel()
        setDefaultState()
    }

    function onChangeRoleCheckbox  (e, { value }) {
        setProfile({
            ...profile,
            role: value
        })
    }

    const { open, onCancel } = props
    const { email, firstName, lastName } = profile

    if (loading) {
        return (
            <Dimmer active={loading} inverted>
                <Loader size='large'>Adding User...</Loader>
            </Dimmer>
        )
    }

    return (
        <div>
            <Modal closeOnDimmerClick={false} dimmer='inverted' open={open} onClose={onCancel}>
                <Modal.Header>
                    Add User
                    </Modal.Header>
                <Modal.Content image>
                    <Modal.Description>
                        <Message className='Profile-error' negative hidden={!errorCode} icon>
                            <Icon name='frown' />
                            <Message.Content>
                                <Message.Header>{messageForErrorCode(errorCode, errorField)}</Message.Header>
                            </Message.Content>
                        </Message>
                        <Form>
                            <Form.Field>
                                <label>First Name</label>
                                <Form.Input fluid icon='address card outline' iconPosition='left'
                                    labelPosition='left' type='text' name='firstName'
                                    value={firstName} onChange={onChange} error={firstNameError}
                                    maxLength={NameMaxLength}
                                    action={firstNameError ? requiredAction : null} autoFocus
                                    autoComplete="given-name"
                                />

                                <label>Last Name</label>
                                <Form.Input fluid icon='address card outline' iconPosition='left'
                                    labelPosition='left' type='text' name='lastName'
                                    value={lastName} onChange={onChange} error={lastNameError}
                                    maxLength={NameMaxLength}
                                    action={lastNameError ? requiredAction : null}
                                    autoComplete="family-name"
                                />

                                <label>Email</label>
                                <Form.Input fluid icon='user' iconPosition='left'
                                    labelPosition='left' type='email' name='email'
                                    value={email} onChange={onChange} error={emailError}
                                    maxLength={EmailMaxLength} action={emailError ? requiredAction : null}
                                    autoComplete="email"
                                />
                            </Form.Field>
                            <Form.Field>
                                <label>Role</label>
                                <Form.Checkbox
                                    radio
                                    label='User'
                                    name='roleRadioGroup'
                                    value={ROLE_USER}
                                    checked={profile.role === 'user'}
                                    onChange={onChangeRoleCheckbox}
                                />
                                <Form.Checkbox
                                    radio
                                    label='Administrator'
                                    name='roleRadioGroup'
                                    value={ROLE_ADMIN}
                                    checked={profile.role === 'admin'}
                                    onChange={onChangeRoleCheckbox}
                                />
                            </Form.Field>
                        </Form>
                    </Modal.Description>
                </Modal.Content>
                <Modal.Actions>
                    <Button primary onClick={onClickAddUser}>Add User</Button>
                    <Button onClick={onClickCancel}>Cancel</Button>
                </Modal.Actions>
            </Modal>
        </div>
    )
}


AddUserModal.propTypes = {
    open: PropTypes.bool,
    onSuccess: PropTypes.func,
    onCancel: PropTypes.func,
}

const mapDispatchToProps = dispatch => ({
    handleServiceError: (serviceError) => {
        handleServiceError(serviceError, dispatch)
    }
})

export default connect(null, mapDispatchToProps)(AddUserModal)