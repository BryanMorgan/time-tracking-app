import React, { useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import { Button, Dimmer, Divider, Form, Loader } from 'semantic-ui-react'
import { createClientApi, getClientApi, updateClientApi } from '../service/clients'
import { isClientNameValid } from '../components/Valid'
import { handleServiceError } from '../components/Util'

const EDIT_CLIENT_PATH_PREFIX = '/client/edit/'

const requiredAction = { content: 'Required', disabled: true, color: 'red' }

const CreateOrUpdateClientPage = (props) => {

    const [loading, setLoading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState('')
    const [client, setClient] = useState({})
    const [clientError, setClientError] = useState(false)
    const [clientNameError, setClientNameError] = useState(false)
    const [taskDropdownPopulated, setTaskDropdownPopulated] = useState(false)
    const [taskDropdownValue, setTaskDropdownValue] = useState({})

    useEffect(() => {
        const { pathname } = props.location

        if (pathname && pathname.startsWith(EDIT_CLIENT_PATH_PREFIX)) {
            let clientId = pathname.substring(EDIT_CLIENT_PATH_PREFIX.length)
            setLoading(true)
            setLoadingMessage('Loading Client...')
            getClientApi(clientId)
                .then(json => setClient(json || {}))
                .catch(serviceError => {
                    console.error("Service Error", serviceError)
                    props.handleServiceError(serviceError)
                })
                .finally(() => setLoading(false))
        }
    }, [])

    function createClient() {
        setLoading(true)
        setLoadingMessage('Creating Client...')

        createClientApi(client)
            .then(json => {
                setLoading(false)
                props.history.push('/clients')
            })
            .catch(serviceError => {
                console.error("Service Error", serviceError)
                props.handleServiceError(serviceError)
            })
    }

    function updateClient() {
        setLoading(true)
        setLoadingMessage('Updating Client...')

        updateClientApi(client)
            .then(json => {
                setLoading(false)
                props.history.push('/clients')
            })
            .catch(serviceError => {
                console.error("Service Error", serviceError)
                setLoading(false)
                props.handleServiceError(serviceError)
            })
    }

    function onChangeClientName(event) {
        setClientNameError(false)
        setClient({
            ...client,
            name: event.target.value
        })
    }

    function onClickCreateOrUpdateClient(e) {
        e.preventDefault()

        if (!isClientNameValid(client.name)) {
            return setClientNameError(true)
        }

        if (props.create) {
            createClient()
        } else {
            if (!client.id) {
                return setClientError(true)
            }
            updateClient()
        }
    }

    function onClickCancel(e) {
        e.preventDefault()
        props.history.push('/clients')
    }

    const { create } = props

    if (loading) {
        return (
            <Dimmer active={loading} inverted>
                <Loader size='large'>{loadingMessage}</Loader>
            </Dimmer>
        )
    }

    if (client.name === undefined || client.name === null) {
        client.name = ''
    }

    return (
        <div className="Projects--container Projects--container-create-update">

            <div>
                <h1>{create ? 'Create' : 'Update'} Client</h1>
                <Divider />
            </div>

            <Form>

                <Form.Field>
                    <label>Client Name</label>
                    <Form.Input fluid type='text' value={client.name} onChange={onChangeClientName}
                        error={clientNameError || clientError} action={clientNameError ? requiredAction : null} />
                </Form.Field>
            </Form>

            <div className='Client--bottom-button-container'>
                <div>
                    <Button positive
                        onClick={onClickCreateOrUpdateClient}>{create ? 'Create' : 'Update'} Client</Button>
                    <Button onClick={onClickCancel}>Cancel</Button>
                </div>
            </div>
        </div>
    )
}

CreateOrUpdateClientPage.propTypes = {
    create: PropTypes.bool,
}

const mapDispatchToProps = dispatch => ({
    handleServiceError: (serviceError) => {
        handleServiceError(serviceError, dispatch)
    }
})

export default connect(null, mapDispatchToProps)(CreateOrUpdateClientPage)

