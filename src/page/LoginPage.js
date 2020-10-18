import React, { useState, useEffect, } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import { Button, Dimmer, Form, Header, Icon, Loader, Message, Segment } from 'semantic-ui-react'
import { loginApi } from '../service/authenticate'
import { Link, Redirect } from 'react-router-dom';
import { loginSuccessful } from '../action/authenticate'
import { EmailMaxLength, EmailMinLength, PasswordMaxLength, PasswordMinLength } from '../components/Constants'
import { isEmailValid, isPasswordValid } from '../components/Valid'

const passwordTooShortAction = { content: 'Too Short', disabled: true, color: 'red' }
const passwordTooLongAction = { content: 'Too Long', disabled: true, color: 'red' }

const LoginPage = (props) => {
    const [loading, setLoading] = useState(false)
    const [errorCode, setErrorCode] = useState('')
    const [errorField, setErrorField] = useState('')
    const [emailError, setEmailError] = useState(false)
    const [passwordError, setPasswordError] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    function messageForErrorCode(code, field) {
        switch (code) {
            case 'ProfileNotFound':
                return 'No user found for that email'
            case 'ProfileLocked':
                return 'Account locked due to too many failed attempts. Try again in a few minutes.'
            case 'ProfileInactive':
                return 'This account has not be activated yet. Please check for a new user setup email.'
            case 'IncorrectPassword':
                return 'Incorrect email or password'
            case 'InvalidEmail':
                return 'Email isn\'t in a valid format'
            case 'FieldSize':
                if (field === 'email') {
                    return 'Email length must be ' + EmailMinLength + ' to ' + EmailMaxLength + ' characters'
                } else if (field === 'password') {
                    return 'Password length must be ' + PasswordMinLength + ' to ' + PasswordMaxLength + ' characters'
                }
                return 'Invalid field size. Please check values.'
            case 'FETCH_FAILED':
                return 'You might be offline. Please try again when you\'re connected to the internet.'
            default:
                return 'Unable to login with those credentials'
        }
    }

    function handleSubmit(e) {
        e.preventDefault();

        const { dispatch } = props

        if (!isEmailValid(email)) {
            return setEmailError(true)
        }

        if (!isPasswordValid(password)) {
            return setPasswordError(true)
        }

        setLoading(true)

        loginApi(email, password)
            .then(json => dispatch(loginSuccessful(json)))
            .catch(serviceError => {
                console.error(serviceError)
                setErrorCode(serviceError.errorCode)
                setErrorField(serviceError.detail.field)
                setLoading(false)
            })
    }

    function onChange(e) {
        const { name, value } = e.target;
        if (name === 'email') {
            setEmail(value)
        } else if (name === 'password') {
            setPassword(value)
        }
        setPasswordError(false)
        setEmailError(false)
        setErrorCode('')
        setErrorField('')
    }

    const { authenticated } = props
    const { from } = props.location.state || { from: { pathname: '/' } }
    const errorStyle = {
        visibility: !errorCode ? 'hidden' : 'visible'
    }

    let passwordErrorAction = null
    if (passwordError) {
        if (password.length < PasswordMinLength) {
            passwordErrorAction = passwordTooShortAction
        } else if (password.length > PasswordMaxLength) {
            passwordErrorAction = passwordTooLongAction
        }
    }

    if (!authenticated) {
        return (
            <div className='Profile-background'>
                <Dimmer active={loading} inverted page>
                    <Loader size='large'>Logging you in...</Loader>
                </Dimmer>
                <div className='Profile-container login'>
                    <div className='Profile-form'>
                        <Message className='Profile-error' negative style={errorStyle} icon floating>
                            <Icon name='frown' />
                            <Message.Content>
                                <Message.Header>{messageForErrorCode(errorCode, errorField)}</Message.Header>
                            </Message.Content>
                        </Message>

                        <Header as='h2' color='blue' textAlign='center'>
                            <Icon name='clock' size='big' />{' '}Login
                            </Header>
                        <Form size='large' onSubmit={handleSubmit}>
                            <Segment stacked>
                                <Form.Input fluid icon='user' iconPosition='left' placeholder='Email'
                                    type='email' name='email' value={email}
                                    onChange={onChange} error={emailError} maxLength={EmailMaxLength}
                                    autoComplete="email"
                                    autoFocus
                                />
                                <Form.Input fluid icon='lock' iconPosition='left' placeholder='Password'
                                    type='password' name='password' value={password}
                                    onChange={onChange}
                                    error={passwordError}
                                    action={passwordErrorAction}
                                    maxLength={PasswordMaxLength}
                                    autoComplete="current-password"
                                />
                                <Button type='submit' color='blue' fluid size='large'>Login</Button>
                                <div className="Profile-link-message">
                                    Need to <Link to="/sign-up">Sign Up</Link>?
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

LoginPage.propTypes = {
    dispatch: PropTypes.func,
    returnTo: PropTypes.string,
};

const mapStateToProps = ({ authenticate }) => ({
    authenticated: authenticate.authenticated,
})

export default connect(mapStateToProps)(LoginPage)

