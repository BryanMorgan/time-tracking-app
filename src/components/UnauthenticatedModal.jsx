import PropTypes from 'prop-types';
import React, { useState, useEffect, } from 'react';
import { connect } from 'react-redux';
import { Button, Icon, Image, Modal } from 'semantic-ui-react';
import { closeErrorModal, logoutAction } from '../action/authenticate';
import useIsMobile from '../components/IsMobile';

const UnauthenticatedModal = (props) => {
    const { open, onClose, redirectToLogin } = props
    const isMobile = useIsMobile();

    return (
        <Modal dimmer='blurring' open={open} onClose={onClose} size='small'>
            <Modal.Header>Oops. You're not logged in.</Modal.Header>
            <Modal.Content image>
                {!isMobile ? <Icon name='info' circular color='blue' size='big' fitted inverted /> : ''}
                <Modal.Description>
                    <p>Please login or try your request again.</p>
                </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
                <Button primary onClick={redirectToLogin}>Login</Button>
                <Button onClick={onClose}>Try Again</Button>
            </Modal.Actions>
        </Modal>
    )
}

UnauthenticatedModal.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    redirectToLogin: PropTypes.func,
};

const mapDispatchToProps = dispatch => ({
    redirectToLogin: () => {
        dispatch(logoutAction())
        dispatch(closeErrorModal())
    }
})

export default connect(null, mapDispatchToProps)(UnauthenticatedModal)