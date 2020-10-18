import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Button, Icon, Image, Modal, Responsive } from 'semantic-ui-react';
import { closeErrorModal, logoutAction } from '../action/authenticate';

const UnauthenticatedModal = (props) => {
    const { open, onClose, redirectToLogin } = props

    return (
        <Modal dimmer='blurring' open={open} onClose={onClose} size='small'>
            <Modal.Header>Oops. You're not logged in.</Modal.Header>
            <Modal.Content image>
                <Responsive as={Image} minWidth={Responsive.onlyTablet.minWidth}>
                    <div>
                        <Icon name='info' circular color='blue' size='big' fitted inverted />
                    </div>
                </Responsive>
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