import React, { useState, useEffect } from 'react';

import { connect } from 'react-redux'
import { Button, Dimmer, Dropdown, Form, Header, Icon, Loader, Segment, Table } from 'semantic-ui-react'
import { CompanyNameMaxLength, timezoneList } from '../components/Constants'
import { isCompanyValid } from '../components/Valid'
import { updateAccountApi, getAccountApi } from '../service/account'
import { updateAccountSuccessful } from '../action/authenticate'
import { handleServiceError } from '../components/Util'
import AddUserModal from '../components/AddUserModal'
import moment from 'moment'

const requiredAction = { content: 'Required', disabled: true, color: 'red' }

const startOfWeekList = [
    { key: 0, value: 0, text: "Sunday" },
    { key: 6, value: 6, text: "Saturday" },
    { key: 1, value: 1, text: "Monday" },
]

const AccountPage = (props) => {
    let loadingDelayTimer = null
    const [loading, setLoading] = useState(false)
    const [companyNameError, setCompanyNameError] = useState(false)
    const [openAddUserModal, setOpenAddUserModal] = useState(false)
    const [account, setAccountState] = useState({
        weekStart: '',
        companyName: '',
        created: '',
        updated: '',
        numberOfUsers: 0,
    })

    useEffect(() => {
        setLoading(true)
        getAccountApi()
            .then(accountJsonData => {
                setAccountState({
                    ...account,
                    companyName: accountJsonData.company,
                    weekStart: accountJsonData.weekStart,
                    timezone: accountJsonData.timezone,
                    created: accountJsonData.created,
                    updated: accountJsonData.updated,
                })
            })
            .catch(serviceError => {
                console.error('service error', serviceError)
                props.handleServiceError(serviceError)
            })
            .finally(() => {
                setLoading(false)
            })
    }, [])

    function handleAccountSubmit(e) {
        e.preventDefault();

        const { companyName, timezone, weekStart } = account

        if (!isCompanyValid(companyName)) {
            return setAccountState({
                ...account,
                companyNameError: true
            })
        }

        loadingDelayTimer = setTimeout(() => setLoading(true), 300)

        updateAccountApi({ companyName, weekStart, timezone })
            .then(props.updateAccountSuccessful)
            .catch(props.handleServiceError)
            .finally(() => {
                clearTimeout(loadingDelayTimer)
                setLoading(false)
            })
    }

    function onChange(e) {
        let { name, value } = e.target;
        setAccountState({
            ...account,
            [name]: value,
            companyNameError: false,
        })
    }

    function onTimezoneChange(e, data) {
        setAccountState({
            ...account,
            timezone: data.value,
        })
    }

    function onWeekStartChange(e, data) {
        setAccountState({
            ...account,
            weekStart: data.value,
        })
    }

    function onClickAddUser() {
        setOpenAddUserModal(true)
    }

    function onClickCancelAddUserModal() {
        setOpenAddUserModal(false)
    }

    function onSuccessAddUserModal(e) {
        setOpenAddUserModal(false)
    }

    const { companyName, weekStart, timezone, numberOfUsers } = account

    if (loading) {
        return (
            <Dimmer active={loading} inverted>
                <Loader size='large'>Loading your account...</Loader>
            </Dimmer>
        )
    }

    return (
        <div className="Account-container" >
            <Header as='h2' icon textAlign='center'>
                <Icon name='building' circular />
                <Header.Content>
                    Account
                </Header.Content>
            </Header>
            <Segment raised>
                <Form onSubmit={handleAccountSubmit}>
                    <Form.Input fluid icon='address card outline' iconPosition='left'
                        label='Company Name' labelPosition='left' type='text' name='companyName'
                        value={companyName} onChange={onChange} error={companyNameError}
                        maxLength={CompanyNameMaxLength} autoFocus
                        action={companyNameError ? requiredAction : null} />

                    <Form.Field>
                        <label>Start of Week</label>
                        <Dropdown placeholder='Start of Week' selection options={startOfWeekList} name='weekStart'
                            onChange={onWeekStartChange} defaultValue={weekStart} />
                    </Form.Field>
                    <Form.Field>
                        <label>Timezone</label>
                        <Dropdown placeholder='Timezone' search selection options={timezoneList} name='timezone'
                            onChange={onTimezoneChange} defaultValue={timezone} />
                    </Form.Field>

                    <Button primary type='submit'>Update Account</Button>
                    <Button icon labelPosition='left' primary onClick={onClickAddUser}>
                    <Icon name='user plus' /> Add User
                </Button>

                </Form>
            </Segment>
            <AddUserModal open={openAddUserModal} onCancel={onClickCancelAddUserModal}
                onSuccess={onSuccessAddUserModal} />

        </div >
    )
}

const mapStateToProps = ({ authenticate }) => ({
    authenticated: authenticate.authenticated,
})

const mapDispatchToProps = dispatch => ({
    handleServiceError: (serviceError) => {
        handleServiceError(serviceError, dispatch)
    },

    updateAccountSuccessful: (json) => {
        dispatch(updateAccountSuccessful(json))
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(AccountPage)

