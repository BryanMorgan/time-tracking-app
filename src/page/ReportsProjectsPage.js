import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import { Table } from 'semantic-ui-react'
import { currencyFormatter } from '../components/Util'
import WaitLoader from '../components/WaitLoader'

const ReportsProjectsPage = (props) => {

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    const { reportData, isMobile, loading } = props

    if (loading) {
        return <WaitLoader active={loading} message='Loading Report...' />
    }

    let projectRows = []

    for (let project of reportData) {
        projectRows.push(
            <Table.Row key={project.projectId} textAlign='right'>
                <Table.Cell className='Reporting--table-cell' textAlign='left'>
                    {isMobile ? <div className='Reporting--table-client-name'>{project.clientName}</div> : null}
                    <div className='Reporting--table-name'>{project.projectName}</div>
                </Table.Cell>
                {!isMobile ? <Table.Cell className='Reporting--table-cell'
                    textAlign='left'>{project.clientName}</Table.Cell> : null}
                <Table.Cell className='Reporting--table-cell'>{project.billableHours}</Table.Cell>
                <Table.Cell className='Reporting--table-cell'>{project.nonBillableHours}</Table.Cell>
                <Table.Cell
                    className='Reporting--table-cell'>{currencyFormatter.format(project.billableTotal)}</Table.Cell>
            </Table.Row>
        )
    }

    return (
        <Table compact='very' celled unstackable>
            <Table.Header>
                <Table.Row textAlign='right'>
                    <Table.HeaderCell textAlign='left' width={isMobile ? 8 : 4}>Project Name</Table.HeaderCell>
                    {!isMobile ?
                        <Table.HeaderCell textAlign='left' width={4}>Client Name</Table.HeaderCell> : null}
                    <Table.HeaderCell>Billable Hours</Table.HeaderCell>
                    <Table.HeaderCell>Non-Billable Hours</Table.HeaderCell>
                    <Table.HeaderCell>Billable Total</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {projectRows}
            </Table.Body>
            <Table.Footer className='Reporting--table-footer'>
                <Table.Row textAlign='right'>
                    <Table.HeaderCell colSpan={isMobile ? 1 : 2}
                        textAlign='left'><b>Total</b></Table.HeaderCell>
                    <Table.HeaderCell><b>{props.billableHoursTotal.toFixed(2)}</b></Table.HeaderCell>
                    <Table.HeaderCell><b>{props.nonBillableHoursTotal.toFixed(2)}</b></Table.HeaderCell>
                    <Table.HeaderCell><b>{currencyFormatter.format(props.billableTotal)}</b></Table.HeaderCell>
                </Table.Row>
            </Table.Footer>
        </Table>
    )
}


ReportsProjectsPage.propTypes = {
    reportData: PropTypes.array.isRequired,
    isMobile: PropTypes.bool.isRequired,
    loading: PropTypes.bool,
    billableHoursTotal: PropTypes.number,
    nonBillableHoursTotal: PropTypes.number,
    billableTotal: PropTypes.number,
}

export default connect()(ReportsProjectsPage)

