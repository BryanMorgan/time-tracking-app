import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import { Table } from 'semantic-ui-react'
import { currencyFormatter } from '../components/Util'
import WaitLoader from '../components/WaitLoader'

const ReportsPersonPage = (props) => {

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    const { reportData, loading } = props

    if (loading) {
        return <WaitLoader active={loading} message='Loading Report...' />
    }

    let personRow = []

    for (let person of reportData) {
        personRow.push(
            <Table.Row key={person.profileId} textAlign='right'>
                <Table.Cell className='Reporting--table-cell' textAlign='left'>
                    <div className='Reporting--table-name'>{person.firstName} {person.lastName}</div>
                </Table.Cell>
                <Table.Cell className='Reporting--table-cell'>{person.billableHours}</Table.Cell>
                <Table.Cell className='Reporting--table-cell'>{person.nonBillableHours}</Table.Cell>
                <Table.Cell
                    className='Reporting--table-cell'>{currencyFormatter.format(person.billableTotal)}</Table.Cell>
            </Table.Row>
        )
    }

    return (
        <Table compact='very' celled unstackable>
            <Table.Header>
                <Table.Row textAlign='right'>
                    <Table.HeaderCell textAlign='left' width={8}>Name</Table.HeaderCell>
                    <Table.HeaderCell>Billable Hours</Table.HeaderCell>
                    <Table.HeaderCell>Non-Billable Hours</Table.HeaderCell>
                    <Table.HeaderCell>Billable Total</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {personRow}
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


ReportsPersonPage.propTypes = {
    reportData: PropTypes.array.isRequired,
    loading: PropTypes.bool,
    billableHoursTotal: PropTypes.number,
    nonBillableHoursTotal: PropTypes.number,
    billableTotal: PropTypes.number,
}

export default connect()(ReportsPersonPage)

