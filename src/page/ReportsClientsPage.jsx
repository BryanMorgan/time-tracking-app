import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import { Table } from 'semantic-ui-react'
import { currencyFormatter } from '../components/Util'
import WaitLoader from '../components/WaitLoader'

const ReportsClientsPage = (props) => {

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    const { reportData, loading } = props

    if (loading) {
        return <WaitLoader active={loading} message='Loading Report...' />
    }

    let clientRows = []

    for (let client of reportData) {
        clientRows.push(
            <Table.Row key={client.clientId} textAlign='right'>
                <Table.Cell className='Reporting--table-cell' textAlign='left'>{client.clientName}</Table.Cell>
                <Table.Cell className='Reporting--table-cell'>{client.billableHours}</Table.Cell>
                <Table.Cell className='Reporting--table-cell'>{client.nonBillableHours}</Table.Cell>
                <Table.Cell
                    className='Reporting--table-cell'>{currencyFormatter.format(client.billableTotal)}</Table.Cell>
            </Table.Row>
        )
    }

    return (
        <Table compact='very' celled unstackable>
            <Table.Header>
                <Table.Row textAlign='right'>
                    <Table.HeaderCell textAlign='left' width={8}>Client Name</Table.HeaderCell>
                    <Table.HeaderCell>Billable Hours</Table.HeaderCell>
                    <Table.HeaderCell>Non-Billable Hours</Table.HeaderCell>
                    <Table.HeaderCell>Billable Total</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {clientRows}
            </Table.Body>
            <Table.Footer className='Reporting--table-footer'>
                <Table.Row textAlign='right'>
                    <Table.HeaderCell textAlign='left'><b>Total</b></Table.HeaderCell>
                    <Table.HeaderCell><b>{props.billableHoursTotal.toFixed(2)}</b></Table.HeaderCell>
                    <Table.HeaderCell><b>{props.nonBillableHoursTotal.toFixed(2)}</b></Table.HeaderCell>
                    <Table.HeaderCell><b>{currencyFormatter.format(props.billableTotal)}</b></Table.HeaderCell>
                </Table.Row>
            </Table.Footer>
        </Table>
    )
}


ReportsClientsPage.propTypes = {
    reportData: PropTypes.array.isRequired,
    isMobile: PropTypes.bool.isRequired,
    loading: PropTypes.bool,
    billableHoursTotal: PropTypes.number,
    nonBillableHoursTotal: PropTypes.number,
    billableTotal: PropTypes.number,
}

export default connect()(ReportsClientsPage)

