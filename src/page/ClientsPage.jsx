import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import { Button, Dimmer, Icon, Loader, Table } from 'semantic-ui-react'
import { archiveClientApi, getAllClientsApi } from '../service/clients'
import ConfirmModal from '../components/ConfirmModal'
import { handleServiceError } from '../components/Util'

const ClientsPage = (props) => {

    const [loading, setLoading] = useState(false)
    const [clients, setClients] = useState([])
    const [archiveClientId, setArchiveClientId] = useState(-1)
    const [archiveClientName, setArchiveClientName] = useState('')
    const [openConfirmArchiveModal, setOpenConfirmArchiveModal] = useState(false)

    useEffect(() => {
        setLoading(true)
        window.scrollTo(0, 0)

        getAllClientsApi()
            .then(json => setClients(json || []))
            .catch(serviceError => {
                console.error("Service Error", serviceError)
                props.handleServiceError(serviceError)
            })
            .finally(() => setLoading(false))
    }, [])

    function resetConfirmArchiveModalState() {
        setArchiveClientId(-1)
        setArchiveClientName('')
        setOpenConfirmArchiveModal(false)
    }

    function archiveClient(clientId) {
        setLoading(true)

        archiveClientApi(clientId)
            .then(json => setClients(clients.filter(client => client.id !== clientId)))
            .catch(serviceError => {
                console.error("Service Error", serviceError)
                props.handleServiceError(serviceError)
            })
            .finally(() => {
                resetConfirmArchiveModalState()
                setLoading(false)
            })
    }

    function onConfirmArchiveClient (id) {
        archiveClient(id)
    }

    function onClickViewArchived(e) {
        e.preventDefault()
        props.viewArchived(true)
    }

    function onClickEditClient(id, e) {
        e.preventDefault()
        props.history.push('/client/edit/' + id)
    }

    function onClickCreateClient(e) {
        e.preventDefault()
        props.history.push('/client/create')
    }

    function onClickArchiveClient (id, name, e) {
        setArchiveClientName(name)
        setArchiveClientId(id)
        setOpenConfirmArchiveModal(true)
    }

    if (loading) {
        return (
            <div className='Global--dimmer-loader'>
                <Dimmer active={loading} inverted>
                    <Loader inline size='large'>Loading Clients...</Loader>
                </Dimmer>
            </div>
        )
    }

    let clientRows = []

    for (let client of clients) {
        clientRows.push(
            <Table.Row key={client.id} className='Clients--summary-table-row'>
                <Table.Cell>{client.name}</Table.Cell>
                <Table.Cell singleLine textAlign='right'>
                    <Button size='tiny' compact
                        onClick={(e) => onClickEditClient(client.id, e)}>Edit</Button>
                    <Button size='tiny' compact
                        onClick={(e) => onClickArchiveClient(client.id, client.name, e)}>Archive</Button>
                </Table.Cell>
            </Table.Row>
        )
    }

    return (
        <div className="Projects--container">

            <div className="Projects--button-row">
                <Button primary icon title='Add Client' alt='Add Client' onClick={onClickCreateClient}>
                    <Icon name='plus' /> Add Client
                    </Button>

                <Button icon title='View Archived' alt='View Archived' onClick={onClickViewArchived}>
                    <Icon name='archive' /> View Archived
                    </Button>
            </div>

            <Table compact unstackable>
                <Table.Body>
                    {clientRows}
                </Table.Body>
            </Table>


            <ConfirmModal
                open={openConfirmArchiveModal}
                title='Archive Client?'
                description={`Do you want to archive the ${archiveClientName} client?`}

                onCancel={() => resetConfirmArchiveModalState()}
                onSuccess={() => onConfirmArchiveClient(archiveClientId)} />
        </div>

    )
}

ClientsPage.propTypes = {
    viewArchived: PropTypes.func,
}

const mapDispatchToProps = dispatch => ({
    handleServiceError: (serviceError) => {
        handleServiceError(serviceError, dispatch)
    }
})

export default connect(null, mapDispatchToProps)(ClientsPage)

