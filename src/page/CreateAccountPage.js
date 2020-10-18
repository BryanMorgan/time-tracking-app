import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { Button, Dimmer, Form, Header, Icon, Loader, Message, Popup, Segment } from 'semantic-ui-react';
import { createAccountSuccessful } from '../action/authenticate';
import {
    CompanyNameMaxLength,
    CompanyNameMinLength,
    EmailMaxLength,
    EmailMinLength,
    NameMaxLength,
    NameMinLength,
    PasswordMaxLength,
    PasswordMinLength
} from '../components/Constants';
import { isCompanyValid, isEmailValid, isNameValid, isPasswordValid } from '../components/Valid';
import { createAccountApi } from '../service/authenticate';

const requiredAction = { content: 'Required', disabled: true, color: 'red' }

const CreateAccountPage = (props) => {
    const [loading, setLoading] = useState(false)
    const [errorCode, setErrorCode] = useState('')
    const [errorField, setErrorField] = useState('')
    const [firstNameError, setFirstNameError] = useState(false)
    const [lastNameError, setLastNameError] = useState(false)
    const [emailError, setEmailError] = useState(false)
    const [passwordError, setPasswordError] = useState(false)
    const [companyError, setCompanyError] = useState(false)
    const [showPasswordHint, setShowPasswordHint] = useState(false)
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        email: '',
        company: '',
        password: '',
    })

    useEffect(() => {
        const inputs = document.querySelectorAll("input");
        inputs.forEach(input => {
            input.addEventListener("invalid", () => { input.classList.add("error") }, false);
        })
    }, [])

    function messageForErrorCode(code, field) {
        switch (code) {
            case 'AccountExists':
                return 'An account already exists for that email.'
            case '4InvalidEmail':
                return 'Email isn\'t in a valid format'
            case 'FieldSize':
                if (field === 'email') {
                    return 'Email length must be ' + EmailMinLength + ' to ' + EmailMaxLength + ' characters'
                } else if (field === 'password') {
                    return 'Password length must be ' + PasswordMinLength + ' to ' + PasswordMaxLength + ' characters'
                } else if (field === 'firstName') {
                    return 'First name length must be ' + NameMinLength + ' to ' + NameMaxLength + ' characters'
                } else if (field === 'lastName') {
                    return 'Last name length must be ' + NameMinLength + ' to ' + NameMaxLength + ' characters'
                } else if (field === 'company') {
                    return 'Company name length must be ' + CompanyNameMinLength + ' to ' + CompanyNameMaxLength + ' characters'
                }

                return 'Invalid field size. Please check values.'
            case 'FETCH_FAILED':
                return 'You might be offline. Please try again when you\'re connected to the internet.'
            default:
                return 'Unable to create an account with those credentials'
        }
    }

    function handleSubmit(e) {
        e.preventDefault();

        const { email, password, firstName, lastName, company } = profile
        const { dispatch } = props

        if (!isNameValid(firstName)) {
            return setFirstNameError(true)
        }

        if (!isNameValid(lastName)) {
            return setLastNameError(true)
        }

        if (!isCompanyValid(company)) {
            return setCompanyError(true)
        }

        if (!isEmailValid(email)) {
            return setEmailError(true)
        }

        if (!isPasswordValid(password)) {
            return setPasswordError(true)
        }

        setLoading(true)

        createAccountApi({ firstName, lastName, company, email, password })
            .then(json => {
                setLoading(false)
                dispatch(createAccountSuccessful(json))
            })
            .catch(serviceError => {
                console.error(serviceError)
                setErrorCode(serviceError.errorCode)
                setErrorField(serviceError.detail.field)
                setLoading(false)
            })
    }

    function onChange(e) {
        const { name, value } = e.target;
        setProfile({
            ...profile,
            [name]: value,
        })

        setErrorCode('')
        setErrorField('')
        setFirstNameError(false)
        setLastNameError(false)
        setCompanyError(false)
        setPasswordError(false)
        setEmailError(false)
    }

    function onPasswordFocus () {
        setShowPasswordHint(true)
    }

    function onPasswordBlur ()  {
        setShowPasswordHint(false)
    }

    const { authenticated } = props
    const { from } = props.location.state || { from: { pathname: '/' } }
    const { email, password, firstName, lastName, company } = profile

    if (!authenticated) {
        return (
            <div className='Profile-background'>
                <Dimmer active={loading} inverted page>
                    <Loader size='large'>Logging you in...</Loader>
                </Dimmer>
                <div className='Profile-container'>
                    <div className='Profile-form'>
                        <Header as='h2' color='blue' textAlign='center'>
                            <Icon name='clock' size='big' />{' '}Create Account
                            </Header>

                        <Form onSubmit={handleSubmit}>
                            <Message className='Profile-error' negative hidden={!errorCode} icon>
                                <Icon name='frown' />
                                <Message.Content>
                                    <Message.Header>{messageForErrorCode(errorCode, errorField)}</Message.Header>
                                </Message.Content>
                            </Message>

                            <Segment stacked>
                                <Form.Input fluid icon='address card outline' iconPosition='left'
                                    label='First Name' labelPosition='left' type='text' name='firstName'
                                    value={firstName} onChange={onChange} error={firstNameError}
                                    maxLength={NameMaxLength}
                                    action={firstNameError ? requiredAction : null} autoFocus
                                    autoComplete="given-name"
                                />

                                <Form.Input fluid icon='address card outline' iconPosition='left'
                                    label='Last Name' labelPosition='left' type='text' name='lastName'
                                    value={lastName} onChange={onChange} error={lastNameError}
                                    maxLength={NameMaxLength}
                                    action={lastNameError ? requiredAction : null}
                                    autoComplete="family-name"
                                />

                                <Form.Input fluid icon='building' iconPosition='left'
                                    label='Company Name' labelPosition='left' type='text' name='company'
                                    value={company} onChange={onChange} error={companyError}
                                    maxLength={CompanyNameMaxLength} 
                                    action={companyError ? requiredAction : null} />

                                <Form.Input fluid icon='user' iconPosition='left'
                                    label='Email' labelPosition='left' type='email' name='email'
                                    value={email} onChange={onChange} error={emailError}
                                    maxLength={EmailMaxLength} action={emailError ? requiredAction : null}
                                    autoComplete="email"
                                />

                                <Popup
                                    trigger={
                                        <Form.Input fluid icon='lock' iconPosition='left'
                                            label='Password' labelPosition='left'
                                            type='password' name='password' value={password}
                                            onFocus={onPasswordFocus} onBlur={onPasswordBlur}
                                            onChange={onChange} error={passwordError}
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

                                <Button type='submit' color='blue' fluid size='large'>Create Account</Button>
                                <div className="Profile-link-message">
                                    By creating an account you agree to the <a href="/terms" target='_blank'>terms
                                        of service</a> and <a href="/privacy" target='_blank'>privacy policy</a>
                                </div>
                            </Segment>
                        </Form>

                    </div>
                </div>
            </div>
        )
    }

    return <Redirect to={from} />
}

CreateAccountPage.propTypes = {
    dispatch: PropTypes.func,
    returnTo: PropTypes.string,
};

const mapStateToProps = ({ authenticate }) => ({
    authenticated: authenticate.authenticated
})

export default connect(mapStateToProps)(CreateAccountPage)

