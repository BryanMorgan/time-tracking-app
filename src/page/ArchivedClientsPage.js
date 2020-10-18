import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux'
import { Button, Dimmer, Icon, Loader, Table } from 'semantic-ui-react'
import { getArchivedClientsApi, restoreArchivedClientsApi } from '../service/clients'
import ConfirmModal from '../components/ConfirmModal'
import { handleServiceError } from '../components/Util'

const ArchivedClientsPage = (props) => {
    const [loading, setLoading] = useState(false)
    const [archivedClients, setArchivedClients] = useState([])
    const [restoreClientId, setRestoreClientId] = useState(-1)
    const [restoreClientName, setRestoreClientName] = useState('')
    const [openConfirmRestoreModal, setOpenConfirmRestoreModal] = useState(false)

    useEffect(() => {
        setLoading(true)
        getArchivedClientsApi()
            .then(json => setArchivedClients(json || []))
            .catch(serviceError => {
                console.error("Service Error", serviceError)
                props.handleServiceError(serviceError)
            })
            .finally(() => setLoading(false))
    }, [])

    function resetConfirmRestoreModalState() {
        setRestoreClientId(-1)
        setRestoreClientName('')
        setOpenConfirmRestoreModal(false)
    }

    function restoreArchivedClient(restoreClientId) {
        setLoading(true)

        restoreArchivedClientsApi(restoreClientId)
            .then(json => {
                let updatedArchivedClients = archivedClients.filter(client => client.id !== restoreClientId)
                setArchivedClients(updatedArchivedClients)
            })
            .catch(serviceError => {
                console.error("Service Error", serviceError)
                props.handleServiceError(serviceError)
            })
            .finally(() => {
                resetConfirmRestoreModalState()
                setLoading(false)
            })
    }

    function onConfirmRestoreClient(id) {
        restoreArchivedClient(id)
    }

    function onClickRestoreClient(id, name, e) {
        setRestoreClientName(name)
        setRestoreClientId(id)
        setOpenConfirmRestoreModal(true)
    }

    function onClickBackToClients(e) {
        e.preventDefault()
        props.viewArchived(false)
    }

    if (loading) {
        return (
            <Dimmer active={loading} inverted>
                <Loader size='large'>Loading Clients...</Loader>
            </Dimmer>
        )
    }

    let clientRows = []

    for (let client of archivedClients) {
        clientRows.push(
            <Table.Row key={client.id} className='Client--summary-table-row'>
                <Table.Cell>{client.name}</Table.Cell>
                <Table.Cell singleLine textAlign='right'>
                    <Button size='tiny' compact
                        onClick={(e) => onClickRestoreClient(client.id, client.name, e)}>Restore</Button>
                </Table.Cell>
            </Table.Row>
        )
    }

    return (
        <div className="Projects--container">

            <div className="Projects--button-row">
                <Button primary icon alt='Back to Active'
                    onClick={onClickBackToClients}>
                    <Icon name='arrow left' /> Back to Active
                    </Button>
            </div>

            {clientRows.length > 0 ?
                <Table compact unstackable>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell colSpan='2' className="Projects--archived-table-header">
                                Archived Clients
                                </Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {clientRows}
                    </Table.Body>
                </Table>
                :
                <div className="Projects--archived-table-no-archived-text">
                    <h4>No archived clients</h4>
                </div>

            }

            <ConfirmModal
                open={openConfirmRestoreModal}
                title='Restore Client?'
                description={`Do you want to restore the ${restoreClientName} Client?`}

                onCancel={() => { resetConfirmRestoreModalState() }}
                onSuccess={() => onConfirmRestoreClient(restoreClientId)} />
        </div>

    );
}


const mapDispatchToProps = dispatch => ({
    handleServiceError: (serviceError) => {
        handleServiceError(serviceError, dispatch)
    }
})

export default connect(null, mapDispatchToProps)(ArchivedClientsPage)

