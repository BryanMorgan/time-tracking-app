import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Button, Dimmer, Form, Header, Icon, Loader, Message, Segment } from 'semantic-ui-react';
import { logoutAction } from '../action/authenticate';
import ConfirmModal from '../components/ConfirmModal';
import { PasswordMaxLength, PasswordMinLength } from '../components/Constants';
import { handleServiceError } from '../components/Util';
import { isPasswordValid } from '../components/Valid';
import { logoutApi, setupNewUserAccount } from '../service/authenticate';

const passwordTooShortAction = { content: 'Too Short', disabled: true, color: 'red' }
const passwordTooLongAction = { content: 'Too Long', disabled: true, color: 'red' }

const NewUserSetupPage = (props) => {
    const [loading, setLoading] = useState(false)
    const [errorCode, setErrorCode] = useState('')
    const [errorField, setErrorField] = useState('')
    const [passwordError, setPasswordError] = useState(false)
    const [openConfirmRedirectModal, setOpenConfirmRedirectModal] = useState(false)
    const [profile, setProfile] = useState({
        firstName: '',
        password: '',
        token: '',
    })

    useEffect(() => {
        let inputFirstName = firstName
        if (props.match.params.firstNameEncoded) {
            inputFirstName = atob(props.match.params.firstNameEncoded)
        }
        setProfile({
            ...profile,
            firstName: inputFirstName,
            token: props.match.params.token
        })
    }, [])

    function messageForErrorCode(code, field) {
        switch (code) {
            case 'ProfileNotFound':
                return 'No user found for that email'
            case 'TokenExpired':
                return 'This invite has expired. Please contact the account owner to be re-invited.'
            case 'InvalidToken':
                return "This account has already been setup. Please login with your credentials."
            case 'FieldSize':
                if (field === 'password') {
                    return 'Password length must be ' + PasswordMinLength + ' to ' + PasswordMaxLength + ' characters'
                }
                return 'Invalid value. Please try again.'
            case 'FETCH_FAILED':
                return 'You might be offline. Please try again when you\'re connected to the internet.'
            default:
                return 'Unable to setup account. Please contact your administrator.'
        }
    }

    function handleSubmit(e) {
        e.preventDefault();
        const { token } = profile

        if (!isPasswordValid(password)) {
            return setPasswordError(true)
        }

        setLoading(true)

        setupNewUserAccount(token, password)
            .then(json => {
                logoutApi()
                    .then(() => {
                        localStorage.removeItem("authenticated")
                        props.logoutAction()
                        setOpenConfirmRedirectModal(true)
                    })
                    .catch(err => {
                        localStorage.removeItem("authenticated")
                        props.logoutAction()
                        setOpenConfirmRedirectModal(true)

                        if (err.errorCode !== 'MissingToken') {
                            console.error('Failed to logout:', err.errorCode)
                        }
                    })
            })
            .catch(serviceError => {
                console.error(serviceError)
                setErrorCode(serviceError.errorCode)
                setErrorField(serviceError.detail.field)
            })
            .finally(() => setLoading(false))
    }

    function onChange(e) {
        const { name, value } = e.target;
        setProfile({
            ...profile,
            [name]: value,
        })
        setPasswordError(false)
        setErrorCode('')
        setErrorField('')
    }

    function onClickConfirm() {
        setOpenConfirmRedirectModal(false)
        props.history.push('/login')
    }

    const { firstName, password } = profile
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

    return (
        <div className='Profile-background'>
            <Dimmer active={loading} inverted page>
                <Loader size='large'>Setting up your account...</Loader>
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
                        Welcome {firstName}!
                        </Header>
                    <Header textAlign='center'>
                        Please setup your account <br /> by setting a strong password
                        </Header>

                    <Form size='large' onSubmit={handleSubmit}>
                        <Segment stacked>
                            <label>Password</label>
                            <Form.Input fluid icon='lock' iconPosition='left'
                                type='password' name='password' value={password}
                                onChange={onChange} error={passwordError}
                                action={passwordErrorAction}
                                maxLength={PasswordMaxLength}
                            />
                            <Button type='submit' color='blue' fluid size='large'>Setup Account</Button>
                        </Segment>
                    </Form>
                </div>
            </div>

            <ConfirmModal open={openConfirmRedirectModal}
                title='Account Setup Complete'
                description="Your account is now setup. Please click 'Continue' to login."
                hideCancelButton={true}
                confirmMessage='Continue'
                onSuccess={onClickConfirm} />
        </div>
    )
}

const mapStateToProps = () => ({})

const mapDispatchToProps = dispatch => ({
    handleServiceError: (serviceError) => {
        handleServiceError(serviceError, dispatch)
    },

    logoutAction: () => {
        dispatch(logoutAction())
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(NewUserSetupPage)

