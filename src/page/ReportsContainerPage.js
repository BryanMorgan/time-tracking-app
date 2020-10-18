import React, { Component, useState, useEffect, forwardRef } from 'react';
import { connect } from 'react-redux'
import { Button, Divider, Dropdown, Label, Tab, Table } from 'semantic-ui-react'
import ReportsClientsPage from './ReportsClientsPage'
import {
    exportClientToCsvApi,
    getClientsReportApi,
    getPersonReportApi,
    getProjectsReportApi,
    getTasksReportApi
} from '../service/reporting'

import {
    currencyFormatter,
    numericFormatter,
    getShortDateString,
    handleServiceError,
    DATE_PICKER_FORMAT
} from '../components/Util'
import { MOBILE_WIDTH } from '../components/Constants'
import moment from 'moment'
import ReportsProjectsPage from './ReportsProjectsPage'
import ReportsTasksPage from './ReportsTasksPage'
import ReportsPersonPage from './ReportsPersonPage'
import DatePicker from 'react-datepicker'


const PROJECTS_REPORTS_PATH_PREFIX = '/reports/projects'
const CLIENTS_REPORTS_PATH_PREFIX = '/reports/clients'
const TASKS_REPORTS_PATH_PREFIX = '/reports/tasks'
const PERSON_REPORTS_PATH_PREFIX = '/reports/person'

const PROJECTS_KEY = 'projects'
const CLIENTS_KEY = 'clients'
const TASK_KEY = 'tasks'
const PERSON_KEY = 'person'

const WEEK_TIME_RANGE = 'week'
const MONTH_TIME_RANGE = 'month'
const QUARTER_TIME_RANGE = 'quarter'
const YEAR_TIME_RANGE = 'year'
const ALL_TIME_RANGE = 'all'
const CUSTOM_TIME_RANGE = 'custom'

const tabData = [
    {
        key: PROJECTS_KEY,
        path: PROJECTS_REPORTS_PATH_PREFIX
    }, {
        key: CLIENTS_KEY,
        path: CLIENTS_REPORTS_PATH_PREFIX
    }, {
        key: TASK_KEY,
        path: TASKS_REPORTS_PATH_PREFIX
    }, {
        key: PERSON_KEY,
        path: PERSON_REPORTS_PATH_PREFIX
    },
]

const timeRangeOptions = [
    { text: 'Week', value: WEEK_TIME_RANGE },
    { text: 'Month', value: MONTH_TIME_RANGE },
    { text: 'Quarter', value: QUARTER_TIME_RANGE },
    { text: 'Year', value: YEAR_TIME_RANGE },
    { text: 'All', value: ALL_TIME_RANGE },
    { text: 'Custom', value: CUSTOM_TIME_RANGE },
]

const ReportsContainerPage = (props) => {
    const [loading, setLoading] = useState(false)
    const [mobile, setMobile] = useState(false)
    const [clients, setClients] = useState([])
    const [fromDate, setFromDate] = useState(moment().endOf('week'))
    const [toDate, setToDate] = useState(moment().endOf('week'))
    const [page, setPage] = useState(0)
    const [timeRangeChoice, setTimeRangeChoice] = useState(YEAR_TIME_RANGE)
    const [showCustomDateRange, setShowCustomDateRange] = useState(false)
    const [customStartDate, setCustomStartDate] = useState('')
    const [customEndDate, setCustomEndDate] = useState('')
    const [reportKey, setReportKey] = useState(PROJECTS_KEY)
    const [clientsReport, setClientsReport] = useState([])
    const [projectsReport, setProjectsReport] = useState([])
    const [tasksReport, setTasksReport] = useState([])
    const [personReport, setPersonReport] = useState([])
    const [billableHoursTotal, setBillableHoursTotal] = useState(0)
    const [nonBillableHoursTotal, setNonBillableHoursTotal] = useState(0)
    const [billableTotal, setBillableTotal] = useState(0)

    const locale = (navigator.languages && navigator.languages[0]) || navigator.language

    const customFromDateRef = React.createRef();
    const customToDateRef = React.createRef();
    const resetBillableTotals = () => {
        setBillableHoursTotal(0)
        setNonBillableHoursTotal(0)
        setBillableTotal(0)
    }

    useEffect(() => {
        setLoading(true)
        let { fromDate, toDate } = getFromDateForTimeRange(timeRangeChoice)
        setFromDate(fromDate)
        setToDate(toDate)
        setMobile(window.innerWidth <= MOBILE_WIDTH)

        const { pathname } = props.location
        resolveReportKey(pathname)

        window.addEventListener('resize', onResize);

        fetchReport(reportKey)

        return function cleanup() {
            window.removeEventListener('resize', onResize);
        }
    }, [])

    useEffect(() => {
        const { pathname } = props.location
        resolveReportKey(pathname)
    }, [props.location])

    useEffect(() => {
        fetchReport(reportKey)
    }, [timeRangeChoice, fromDate, toDate])

    function onResize() {
        if (!mobile && window.innerWidth <= MOBILE_WIDTH) {
            setMobile(true)
        }
        if (mobile && window.innerWidth > MOBILE_WIDTH) {
            setMobile(false)
        }
    }

    function resolveReportKey(pathname) {
        let updatedReportKey = PROJECTS_KEY

        if (pathname) {
            for (let tab of tabData) {
                if (pathname.startsWith(tab.path)) {
                    updatedReportKey = tab.key
                }
            }
        }

        if (updatedReportKey && updatedReportKey !== reportKey) {
            setReportKey(updatedReportKey)
        }

        return updatedReportKey
    }

    function getFromDateForTimeRange(timeRangeChoice) {
        let fromDate = moment()
        let toDate = moment()
        switch (timeRangeChoice) {
            case WEEK_TIME_RANGE:
                fromDate = fromDate.startOf('week')
                toDate = toDate.endOf('week')
                adjustForWeekStart(fromDate, toDate, props.weekStart)
                break
            case MONTH_TIME_RANGE:
                fromDate = fromDate.startOf('month')
                toDate = toDate.endOf('month')
                break
            case QUARTER_TIME_RANGE:
                fromDate = fromDate.startOf('quarter')
                toDate = toDate.endOf('quarter')
                break
            case YEAR_TIME_RANGE:
                fromDate = fromDate.startOf('year')
                toDate = toDate.endOf('year')
                break
            case ALL_TIME_RANGE:
                fromDate = moment(0)
                toDate = toDate.add(100, 'years')
                break
            case CUSTOM_TIME_RANGE:
                fromDate = fromDate.startOf('month')
                toDate = toDate.endOf('month')
                break
            default:
                fromDate = fromDate.startOf('year')
                toDate = toDate.endOf('year')
        }

        return {
            fromDate: getShortDateString(fromDate),
            toDate: getShortDateString(toDate),
        }
    }

    function fetchReport(reportKey) {
        switch (reportKey) {
            case CLIENTS_KEY:
                getClientsReport()
                break;
            case PROJECTS_KEY:
                getProjectsReport()
                break;
            case TASK_KEY:
                getTasksReport()
                break;
            case PERSON_KEY:
                getPersonReport()
                break;
            default:
                console.error('No key for report type', reportKey)
        }
    }

    function getClientsReport() {
        setLoading(true)

        getClientsReportApi(fromDate, toDate, page)
            .then(json => {
                let { billableHoursTotal, nonBillableHoursTotal, billableTotal } = computeBillableMetrics(json)
                setClientsReport(json || [])
                setBillableHoursTotal(billableHoursTotal)
                setNonBillableHoursTotal(nonBillableHoursTotal)
                setBillableTotal(billableTotal)
            })
            .catch(serviceError => {
                console.error("Service Error", serviceError)
                props.handleServiceError(serviceError)
                resetBillableTotals()
            })
            .finally(() => setLoading(false))
    }

    function getProjectsReport() {
        setLoading(true)

        getProjectsReportApi(fromDate, toDate, page)
            .then(json => {
                let { billableHoursTotal, nonBillableHoursTotal, billableTotal } = computeBillableMetrics(json)
                setProjectsReport(json || [])
                setBillableHoursTotal(billableHoursTotal)
                setNonBillableHoursTotal(nonBillableHoursTotal)
                setBillableTotal(billableTotal)
            })
            .catch(serviceError => {
                console.error("Service Error", serviceError)
                props.handleServiceError(serviceError)
                resetBillableTotals()
            })
            .finally(() => setLoading(false))
    }

    function getTasksReport() {
        setLoading(true)

        getTasksReportApi(fromDate, toDate, page)
            .then(json => {
                let { billableHoursTotal, nonBillableHoursTotal, billableTotal } = computeBillableMetrics(json)
                setTasksReport(json || [])
                setBillableHoursTotal(billableHoursTotal)
                setNonBillableHoursTotal(nonBillableHoursTotal)
                setBillableTotal(billableTotal)
            })
            .catch(serviceError => {
                console.error("Service Error", serviceError)
                props.handleServiceError(serviceError)
                resetBillableTotals()
            })
            .finally(() => setLoading(false))
    }

    function getPersonReport() {
        setLoading(true)

        getPersonReportApi(fromDate, toDate, page)
            .then(json => {
                let { billableHoursTotal, nonBillableHoursTotal, billableTotal } = computeBillableMetrics(json)
                setPersonReport(json || [])
                setBillableHoursTotal(billableHoursTotal)
                setNonBillableHoursTotal(nonBillableHoursTotal)
                setBillableTotal(billableTotal)
            })
            .catch(serviceError => {
                console.error("Service Error", serviceError)
                props.handleServiceError(serviceError)
                resetBillableTotals()
            })
            .finally(() => setLoading(false))
    }

    function onClickExportToCsv() {
        setLoading(true)

        exportClientToCsvApi(reportKey, fromDate, toDate)
            .then(csv => {
                let link = document.createElement("a");
                let url = URL.createObjectURL(csv);
                link.setAttribute("href", url);
                let cleanCompany = props.company.replace(/[^a-zA-Z0-9]+/g, '-')
                let filename = `export_${cleanCompany}_${fromDate}_to_${toDate}.csv`
                link.setAttribute('download', filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            })
            .catch(serviceError => {
                console.error("Service Error", serviceError)
                props.handleServiceError(serviceError)
            })
            .finally(() => setLoading(false))
    }


    function computeBillableMetrics(rows) {
        let billableHoursTotal = 0
        let nonBillableHoursTotal = 0
        let billableTotal = 0
        if (rows) {
            for (let row of rows) {
                billableHoursTotal += row.billableHours || 0
                nonBillableHoursTotal += row.nonBillableHours || 0
                billableTotal += row.billableTotal || 0
            }
        }

        return {
            billableHoursTotal,
            nonBillableHoursTotal,
            billableTotal,
        }
    }

    function getPanes(isMobile, loading) {
        return [
            {
                menuItem: { key: PROJECTS_KEY, icon: isMobile ? null : 'users', content: 'Projects' },
                render: () =>
                    <Tab.Pane key={PROJECTS_KEY}>
                        <ReportsProjectsPage history={props.history} reportData={projectsReport}
                            isMobile={isMobile} loading={loading}
                            billableHoursTotal={billableHoursTotal}
                            nonBillableHoursTotal={nonBillableHoursTotal}
                            billableTotal={billableTotal}
                        />
                        <Button onClick={onClickExportToCsv}>Export to CSV</Button>
                    </Tab.Pane>
            },
            {
                menuItem: { key: CLIENTS_KEY, icon: isMobile ? null : 'building outline', content: 'Clients' },
                render: () =>
                    <Tab.Pane key={CLIENTS_KEY}>
                        <ReportsClientsPage history={props.history} reportData={clientsReport}
                            isMobile={isMobile} loading={loading}
                            billableHoursTotal={billableHoursTotal}
                            nonBillableHoursTotal={nonBillableHoursTotal}
                            billableTotal={billableTotal}
                        />
                        <Button onClick={onClickExportToCsv}>Export to CSV</Button>
                    </Tab.Pane>,
            },
            {
                menuItem: { key: TASK_KEY, icon: isMobile ? null : 'tasks', content: 'Tasks' },
                render: () =>
                    <Tab.Pane key={TASK_KEY}>
                        <ReportsTasksPage history={props.history} reportData={tasksReport}
                            loading={loading}
                            billableHoursTotal={billableHoursTotal}
                            nonBillableHoursTotal={nonBillableHoursTotal}
                            billableTotal={billableTotal}
                        />
                        <Button onClick={onClickExportToCsv}>Export to CSV</Button>
                    </Tab.Pane>,
            },
            {
                menuItem: { key: PERSON_KEY, icon: isMobile ? null : 'user', content: 'Person' },
                render: () =>
                    <Tab.Pane key={PERSON_KEY}>
                        <ReportsPersonPage history={props.history} reportData={personReport}
                            loading={loading}
                            billableHoursTotal={billableHoursTotal}
                            nonBillableHoursTotal={nonBillableHoursTotal}
                            billableTotal={billableTotal}
                        />
                        <Button onClick={onClickExportToCsv}>Export to CSV</Button>
                    </Tab.Pane>,
            }
        ]
    }

    function adjustForWeekStart(fromDate, toDate, weekStart) {
        let todayWeekday = moment().weekday()
        if (weekStart <= todayWeekday) {
            fromDate.add(weekStart, 'days')
            toDate.add(weekStart, 'days')
        } else {
            fromDate.subtract(7 - weekStart, 'days')
            toDate.subtract(7 - weekStart, 'days')
        }
    }

    function onTabChange(event, data) {
        const reportKey = tabData[data.activeIndex].key
        setReportKey(reportKey)
        props.history.push(tabData[data.activeIndex].path)
        fetchReport(reportKey)
    }

    function onChangeTimeRange(event, data) {
        if (!data.value) {
            console.error('No time range value found')
            return
        }

        let showCustom = false
        if (data.value === CUSTOM_TIME_RANGE) {
            showCustom = true
        }

        let { fromDate, toDate } = getFromDateForTimeRange(data.value)

        setFromDate(fromDate)
        setToDate(toDate)
        setShowCustomDateRange(showCustom)
        setTimeRangeChoice(data.value)
    }

    function onChangeFromDatePicker(date) {
        setFromDate(date)
    }

    function onChangeToDatePicker(date) {
        setToDate(date)
    }

    function onClickTimeNavigation(amount) {
        let newFromDate, newToDate
        switch (timeRangeChoice) {
            case WEEK_TIME_RANGE:
                newFromDate = moment(fromDate).add(amount, 'weeks')
                newToDate = moment(toDate).add(amount, 'weeks')
                break
            case MONTH_TIME_RANGE:
                newFromDate = moment(fromDate).add(amount, 'months')
                newToDate = moment(toDate).add(amount, 'months')
                break
            case QUARTER_TIME_RANGE:
                newFromDate = moment(fromDate).add(amount * 3, 'months')
                newToDate = moment(toDate).add(amount * 3, 'months')
                break
            case YEAR_TIME_RANGE:
                newFromDate = moment(fromDate).add(amount, 'years')
                newToDate = moment(toDate).add(amount, 'years')
                break
            default:
                newFromDate = moment(fromDate).add(amount, 'months')
                newToDate = moment(toDate).add(amount, 'months')
                console.error('Invalid time range choice: ' + timeRangeChoice)
                break
        }

        setFromDate(newFromDate)
        setToDate(newToDate)
    }

    function getTabIndexForKey(key) {
        let tabIndex = tabData.findIndex((element) => element.key === key)
        return tabIndex > -1 ? tabIndex : 0
    }

    function getTimeDisplay() {
        switch (timeRangeChoice) {
            case WEEK_TIME_RANGE:
                return moment(fromDate).format('DD') + ' - ' + moment(toDate).format('DD MMM YYYY')
            case MONTH_TIME_RANGE:
                return moment(fromDate).format('MMM YYYY')
            case QUARTER_TIME_RANGE:
                return moment(fromDate).format('DD MMM') + ' - ' + moment(toDate).format('DD MMM YYYY')
            case YEAR_TIME_RANGE:
                return moment(fromDate).format('YYYY')
            case ALL_TIME_RANGE:
                return 'All Time'
            case CUSTOM_TIME_RANGE:
                return moment(fromDate).format('DD MMM YYYY') + ' - ' + moment(toDate).format('DD MMM YYYY')
            default:
                return moment(fromDate).format('DD MMM YYYY') + ' - ' + moment(toDate).format('DD MMM YYYY')
        }
    }

    function isTimeNavigationEnabled() {
        return timeRangeChoice !== ALL_TIME_RANGE
    }

    let tabIndex = getTabIndexForKey(reportKey)

    return (

        <div className="Reporting--container Project--tab-containers">
            <div className='Reporting--navigation-container'>

                <div className='Reporting--navigation-top-row'>
                    <Dropdown className='Reporting--navigation-time-dropdown'
                        fluid search selection
                        options={timeRangeOptions}
                        defaultValue={timeRangeChoice}
                        onChange={onChangeTimeRange}
                    />
                    <div className="Reporting--navigation-time-display">
                        {getTimeDisplay()}
                    </div>
                </div>

                {showCustomDateRange
                    ?
                    <div className='Reporting--navigation-bottom-row'>
                        <DatePicker
                            name='fromDate'
                            selected={moment(fromDate).toDate()}
                            onChange={onChangeFromDatePicker}
                            customInput={<CustomDateInput label='From:' ref={customFromDateRef} />}
                            dateFormat={DATE_PICKER_FORMAT}
                            showYearDropdown
                            dropdownMode="select"
                            monthsShown={1}
                            locale={moment.locale(locale)}
                            todayButton="Go to Today"
                            popperPlacement="top-start"
                        />

                        <DatePicker
                            name='toDate'
                            selected={moment(toDate).toDate()}
                            onChange={onChangeToDatePicker}
                            customInput={<CustomDateInput label='To:' ref={customToDateRef} />}
                            dateFormat={DATE_PICKER_FORMAT}
                            monthsShown={1}
                            showYearDropdown
                            dropdownMode="select"
                            locale={moment.locale(locale)}
                            todayButton="Go to Today"
                            popperPlacement="bottom-start"
                            popperModifiers={{
                                preventOverflow: {
                                    enabled: true,
                                    escapeWithReference: false,
                                    boundariesElement: 'viewport'
                                }
                            }}
                        />
                    </div>

                    :
                    <div className='Reporting--navigation-middle-row'>
                        <div className='Reporting--navigation-left-right-buttons'>
                            <Button disabled={!isTimeNavigationEnabled()} compact basic attached='left'
                                icon='left arrow'
                                onClick={() => onClickTimeNavigation(-1)}
                            />
                            <Button disabled={!isTimeNavigationEnabled()} compact basic attached='right'
                                icon='right arrow'
                                onClick={() => onClickTimeNavigation(+1)}
                            />
                        </div>
                    </div>
                }
            </div>

            <Divider />

            <div className='Reporting--summary-metrics-container'>
                <div className='Reporting--summary-metric'>
                    <div className='Reporting--summary-metric-value'>
                        {currencyFormatter.format(billableTotal)}
                    </div>
                    <div className='Reporting--summary-metric-name'>
                        Billable Total
                        </div>
                </div>
                <div className='Reporting--summary-metric'>
                    <div className='Reporting--summary-metric-value'>
                        {numericFormatter.format(billableHoursTotal + nonBillableHoursTotal)}
                    </div>
                    <div className='Reporting--summary-metric-name'>
                        Total Hours
                        </div>
                </div>
                <div className='Reporting--summary-metric'>
                    <div className='Reporting--summary-metric-value'>
                        {numericFormatter.format(billableHoursTotal)}
                    </div>
                    <div className='Reporting--summary-metric-name'>
                        Billable Hours
                        </div>
                </div>
                <div className='Reporting--summary-metric'>
                    <div className='Reporting--summary-metric-value'>
                        {numericFormatter.format(nonBillableHoursTotal)}
                    </div>
                    <div className='Reporting--summary-metric-name'>
                        Non-Billable Hours
                        </div>
                </div>
            </div>

            <Tab panes={getPanes(mobile, loading)} activeIndex={tabIndex}
                onTabChange={onTabChange}
            />
        </div>
    )
}

const CustomDateInput = forwardRef(({ label, value, onClick}, _ref) => (
    <Button as='div' labelPosition='left' ref={_ref}>
        <Label color='blue'>{label}</Label>
        <Button size='small' basic className="Reporting--custom-date-input" onClick={onClick}>
            {value}
        </Button>
    </Button>
))

ReportsContainerPage.propTypes = {}

const mapStateToProps = ({ authenticate }) => {
    return {
        weekStart: authenticate.weekStart,
        company: authenticate.company,
    }
}

const mapDispatchToProps = dispatch => ({
    handleServiceError: (serviceError) => {
        handleServiceError(serviceError, dispatch)
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(ReportsContainerPage)

