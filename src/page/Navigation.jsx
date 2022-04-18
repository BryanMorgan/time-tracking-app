import React, { useState, useEffect, } from 'react';
import { connect } from 'react-redux'
import { NavLink, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Dimmer, Dropdown, Icon, Loader, Menu, Grid } from 'semantic-ui-react'
import { logoutApi } from '../service/authenticate'
import { logoutAction } from '../action/authenticate'
import useIsMobile from '../components/IsMobile';

const MAX_NAME_LENGTH = 20
const MAX_COMPANY_LENGTH = 40

const Navigation = (props) => {
    const [pendingLogout, setPendingLogout] = useState(false)
    const [visible, setVisible] = useState(false)
    const isMobile = useIsMobile();

    function logout() {
        setPendingLogout(true)

        logoutApi()
            .catch(err => {
                if (err.errorCode !== 'MissingToken') {
                    console.error('Failed to logout: ', err)
                }
            })
            .finally(() => {
                localStorage.removeItem("authenticated")
                setPendingLogout(false)
                props.dispatch(logoutAction())
            })
    }

    function getLeftMenu() {
        return [
            <Menu.Item key='time' as={NavLink} to='/time'>Time</Menu.Item>,
            <Menu.Item key='project' as={NavLink} to='/projects'>Projects</Menu.Item>,
            <Menu.Item key='reports' as={NavLink} to='/reports'>Reports</Menu.Item>,
        ]
    }

    function getDropDownMenuTrigger() {
        const { trimmedFirstName } = props
        return (<div><Icon name='user circle outline' /><span>{trimmedFirstName}</span></div>)
    }

    function getDropDownNameCompany() {
        const { trimmedFirstName, trimmedLastName, trimmedCompany } = props

        return (
            <div>
                <div className='Navigation-menu-name'>{trimmedFirstName + " " + trimmedLastName}</div>
                <span className='Navigation-menu-company'>{trimmedCompany}</span>
            </div>
        )
    }

    function getRightMenu() {
        let { multipleAccounts } = props

        return (
            <Menu.Menu position='right'>
                <Dropdown trigger={getDropDownMenuTrigger()} item floating pointing='top'>
                    <Dropdown.Menu>
                        <Dropdown.Item content={getDropDownNameCompany()} />
                        <Dropdown.Divider />
                        <Dropdown.Item as={NavLink} to='/profile' text='Profile' />
                        <Dropdown.Divider />
                        <Dropdown.Item as={NavLink} to='/account' text='Account' />
                        <Dropdown.Divider />
                        {multipleAccounts ?
                            <Dropdown.Item as={NavLink} to='/switch-account' text='Switch Account' /> : null}
                        <Dropdown.Item onClick={logout} text='Logout' />
                    </Dropdown.Menu>
                </Dropdown>
            </Menu.Menu>
        )
    }

    const { authenticated } = props

    if (pendingLogout) {
        return (
            <Dimmer active inverted>
                <Loader size='large'>Logging you out</Loader>
            </Dimmer>)
    }

    if (!authenticated) {
        return null
    }

    if (isMobile) {
        return (
            <Menu compact size='small' fluid icon>
                <Menu.Menu position='left'>
                    <Dropdown item icon='sidebar' selectOnBlur={false}>
                        <Dropdown.Menu>
                            {getLeftMenu()}
                        </Dropdown.Menu>
                    </Dropdown>
                </Menu.Menu>

                {getRightMenu()}
            </Menu>)
    } else {
        return (
            <Menu size='large' color='blue' fluid icon>
                {getLeftMenu()}
                {getRightMenu()}
            </Menu>)
    }
}


Navigation.propTypes = {
    authenticated: PropTypes.bool,
    dispatch: PropTypes.func,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    company: PropTypes.string,
}

const mapStateToProps = ({ authenticate }) => {
    return {
        authenticated: authenticate.authenticated,
        firstName: authenticate.firstName,
        lastName: authenticate.lastName,
        company: authenticate.company,
        multipleAccounts: authenticate.multipleAccounts,
        trimmedFirstName: trimToMaxLength(authenticate.firstName, MAX_NAME_LENGTH),
        trimmedLastName: trimToMaxLength(authenticate.lastName, MAX_NAME_LENGTH),
        trimmedCompany: trimToMaxLength(authenticate.company, MAX_COMPANY_LENGTH),
    }
}

function trimToMaxLength(value, maxLength = MAX_NAME_LENGTH) {
    let trimmedValue = value
    if (value) {
        trimmedValue = value.slice(0, maxLength)
        if (value.length > maxLength) {
            trimmedValue = trimmedValue + "\u2026"
        }
    }

    return trimmedValue
}

export default withRouter(connect(mapStateToProps)(Navigation))
