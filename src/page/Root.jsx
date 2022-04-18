import React, { useState, useEffect } from 'react';
import { Redirect, Route, Switch, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import PropTypes from 'prop-types';

import HomePage from './HomePage'
import TimePage from './TimePage'
import ProfilePage from './ProfilePage'
import LoginPage from './LoginPage'
import ProjectsContainerPage from './ProjectsContainerPage'
import CreateAccountPage from './CreateAccountPage'
import TermsOfServicePage from './TermsOfServicePage'
import PrivacyPolicyPage from './PrivacyPolicyPage'
import AccountPage from './AccountPage'
import CreateOrUpdateProjectPage from './CreateOrUpdateProjectPage'
import CreateOrUpdateClientPage from './CreateOrUpdateClientPage'
import CreateOrUpdateTaskPage from './CreateOrUpdateTaskPage'
import NewUserSetupPage from './NewUserSetupPage'
import ReportsContainerPage from './ReportsContainerPage'

const Root = (props) => {

    if (!props.authenticated) {
        return (
            <Switch>
                <Route path="/login" component={LoginPage} />
                <Route path="/sign-up" component={CreateAccountPage} />
                <Route path="/new-user/:firstNameEncoded/:token" exact component={NewUserSetupPage} />
                <Route path="/terms" component={TermsOfServicePage} />
                <Route path="/privacy" component={PrivacyPolicyPage} />
                <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
            </Switch>
        );
    }

    return (
        <Switch>
            <Route path="/" exact component={HomePage} />
            <Route path="/time" component={TimePage} />
            <Route path="/profile" component={ProfilePage} />
            <Route path="/account" exact component={AccountPage} />
            <Route path="/projects/create"
                render={(props) => <CreateOrUpdateProjectPage {...props} create={true} />} />
            <Route path="/projects/edit"
                render={(props) => <CreateOrUpdateProjectPage {...props} create={false} />} />
            <Route path="/projects" render={(props) => <ProjectsContainerPage {...props} tabKey='projects' />} />
            <Route path="/client/create" render={(props) => <CreateOrUpdateClientPage {...props} create={true} />} />
            <Route path="/client/edit" render={(props) => <CreateOrUpdateClientPage {...props} create={false} />} />
            <Route path="/clients" render={(props) => <ProjectsContainerPage {...props} tabKey='clients' />} />
            <Route path="/task/create" render={(props) => <CreateOrUpdateTaskPage {...props} create={true} />} />
            <Route path="/task/edit" render={(props) => <CreateOrUpdateTaskPage {...props} create={false} />} />
            <Route path="/tasks" render={(props) => <ProjectsContainerPage {...props} tabKey='tasks' />} />
            <Route path="/reports" component={ReportsContainerPage} />
            <Route path="/terms" component={TermsOfServicePage} />
            <Route path="/privacy" component={PrivacyPolicyPage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/sign-up" component={CreateAccountPage} />

            < Redirect to="/" />
        </Switch>
    )
}


Root.propTypes = {
    authenticated: PropTypes.bool,
    dispatch: PropTypes.func,
}

const mapStateToProps = ({ authenticate }) => ({
    authenticated: authenticate.authenticated
})

export default withRouter(connect(mapStateToProps)(Root))
