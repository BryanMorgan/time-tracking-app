import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { closeErrorModal, loginSuccessful, tokenInvalid } from './action/authenticate';
import ErrorModal from './components/ErrorModal';
import UnauthenticatedModal from './components/UnauthenticatedModal';
import WaitLoader from './components/WaitLoader';
import Navigation from './page/Navigation';
import Root from './page/Root';
import { tokenApi } from './service/authenticate';

const App = (props) => {
    let timer = null
    const [loading, setLoading] = useState(false)
    const [delayWaitCursor, setDelayWaitCursor] = useState(false)

    useEffect(() => {
        setLoading(true)
        setDelayWaitCursor(true)

        tokenApi()
            .then((json) => {
                props.loginSuccessful(json)
            })
            .catch(err => {
                props.invalidToken(err)
                if (err.errorCode !== 'MissingToken') {
                    console.error("Failed to fetch token", err)
                }
            })
            .finally(() => {
                clearTimeout(timer);
                setLoading(false)
                setDelayWaitCursor(false)
            })

        // Delay the wait cursor for 300ms to avoid flashing
        timer = setTimeout(() => {
            if (loading) {
                setDelayWaitCursor(false)
            }
        }, 300);

        return () => {
            clearTimeout(timer);
        }
    }, [])

    if (loading) {
        return delayWaitCursor ? null : <WaitLoader active={loading} message='App booting up...' />
    }

    return (
        <div className="App">
            <Navigation />
            <Root />

            <ErrorModal open={props.serverError}
                errorTitle={props.serverErrorTitle}
                errorMessage={props.serverErrorMessage}
                errorActionMessage={props.serverErrorActionMessage}
                onClose={props.closeErrorModal}
            />
            <UnauthenticatedModal open={props.sessionExpiredError} onClose={props.closeErrorModal} />
        </div>
    )
}

App.propTypes = {
    dispatch: PropTypes.func,
};

const mapStateToProps = ({ authenticate }) => ({
    authenticated: authenticate.authenticated,
    sessionExpiredError: authenticate.sessionExpiredError,
    serverError: authenticate.serverError,
    serverErrorMessage: authenticate.serverErrorMessage,
    serverErrorActionMessage: authenticate.serverErrorActionMessage,
    serverErrorTitle: authenticate.serverErrorTitle,
})

const mapDispatchToProps = dispatch => ({
    closeErrorModal: () => {
        dispatch(closeErrorModal())
    },

    loginSuccessful: (json) => {
        dispatch(loginSuccessful(json))
    },

    invalidToken: (err) => {
        dispatch(tokenInvalid(err))
    },
})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App))
