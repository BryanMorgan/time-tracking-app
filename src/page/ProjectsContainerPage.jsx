import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Tab } from 'semantic-ui-react';
import ArchivedClientsPage from './ArchivedClientsPage';
import ArchivedProjectsPage from './ArchivedProjectsPage';
import ArchivedTasksPage from './ArchivedTasksPage';
import ClientsPage from './ClientsPage';
import ProjectsPage from './ProjectsPage';
import TasksPage from './TasksPage';

const tabData = [
    {
        key: 'projects',
        path: '/projects'
    }, {
        key: 'clients',
        path: '/clients'
    }, {
        key: 'tasks',
        path: '/tasks'
    },
]

const ProjectsContainerPage = (props) => {
    const [projectMode, setProjectMode] = useState('active')
    const [clientMode, setClientMode] = useState('active')
    const [taskMode, setTaskMode] = useState('active')

    const showArchivedProjects = (showArchived) => setProjectMode(showArchived ? 'archived' : 'active')
    const showArchivedClients = (showArchived) => setClientMode(showArchived ? 'archived' : 'active')
    const showArchivedTasks = (showArchived) => setTaskMode(showArchived ? 'archived' : 'active')

    function getPanes() {
        return [
            {
                menuItem: { key: 'projects', icon: 'users', content: 'Projects' },
                render: () =>
                    <Tab.Pane key='projects'>
                        {projectMode === 'active' ?
                            <ProjectsPage history={props.history} viewArchived={showArchivedProjects} />
                            :
                            <ArchivedProjectsPage viewArchived={showArchivedProjects} />
                        }
                    </Tab.Pane>
            },
            {
                menuItem: { key: 'clients', icon: 'building outline', content: 'Clients' },
                render: () =>
                    <Tab.Pane key='clients'>
                        {clientMode === 'active' ?
                            <ClientsPage history={props.history} viewArchived={showArchivedClients} />
                            :
                            <ArchivedClientsPage viewArchived={showArchivedClients} />
                        }
                    </Tab.Pane>,
            },
            {
                menuItem: { key: 'tasks', icon: 'tasks', content: 'Tasks' },
                render: () =>
                    <Tab.Pane key='tasks'>
                        {taskMode === 'active' ?
                            <TasksPage history={props.history} viewArchived={showArchivedTasks} />
                            :
                            <ArchivedTasksPage viewArchived={showArchivedTasks} />
                        }
                    </Tab.Pane>,
            },
        ]
    }

    function onTabChange(event, data) {
        setProjectMode('active')
        setClientMode('active')
        setTaskMode('active')
        props.history.push(tabData[data.activeIndex].path)
    }

    function getTabIndexForKey(key) {
        let tabIndex = tabData.findIndex((element) => element.key === key)
        return tabIndex > -1 ? tabIndex : 0
    }

    let tabIndex = getTabIndexForKey(props.tabKey)

    return (
        <div>
            <Tab panes={getPanes()} activeIndex={tabIndex} className="Project--tab-containers"
                onTabChange={onTabChange} />
        </div>
    )
}

ProjectsContainerPage.propTypes = {
    tabKey: PropTypes.string.isRequired,
}

export default connect(null)(ProjectsContainerPage)

