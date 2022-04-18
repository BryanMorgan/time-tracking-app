import React from 'react';
import { connect } from 'react-redux'
import { Link } from 'react-router-dom';
import { Icon, List } from 'semantic-ui-react';
import { handleServiceError } from '../components/Util';

const HomePage = (props) => {
    return (
        <div className="App">
            <header className="App-header">
                <h1 className="App-title"><Icon name='clock' size='big' /> {props.company}</h1>
            </header>
            <div className="Home--link-list">
                <List relaxed>
                    <List.Item>
                        <List.Icon name='clock outline' />
                        <List.Content><Link to="/time">Time</Link></List.Content>
                    </List.Item>
                    <List.Item>
                        <List.Icon name='tasks' />
                        <List.Content><Link to="/projects">Projects</Link></List.Content>
                    </List.Item>
                    <List.Item>
                        <List.Icon name='chart bar' />
                        <List.Content><Link to="/reports">Reports</Link></List.Content>
                    </List.Item>
                </List>
            </div>
        </div>

    );
}

const mapStateToProps = ({ authenticate }) => ({
    authenticated: authenticate.authenticated,
    company: authenticate.company,
})

const mapDispatchToProps = dispatch => ({
    handleServiceError: (serviceError) => {
        handleServiceError(serviceError, dispatch)
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(HomePage)
