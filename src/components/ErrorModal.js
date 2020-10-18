import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux'
import { Button, Icon, Image, Modal, Responsive } from 'semantic-ui-react'

const ErrorModal = (props) => {

    const { errorMessage, errorActionMessage, open, onClose } = props
    let actionMessage = errorActionMessage || "Please try your request again"

    return (
        <Modal dimmer='blurring' open={open} onClose={onClose} size='small'>
            <Modal.Header>
                {props.errorTitle
                    ? props.errorTitle
                    : 'Hmmm, an unexpected error happened'}
            </Modal.Header>
            <Modal.Content image>
                <Responsive as={Image} minWidth={Responsive.onlyTablet.minWidth}>
                    <div>
                        <Icon name='warning sign' circular color='orange' size='big' fitted inverted />
                    </div>
                </Responsive>
                <Modal.Description>
                    <h4>{errorMessage}</h4>
                    <p>{actionMessage}</p>
                </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
                <Button primary onClick={onClose}>Try Again</Button>
            </Modal.Actions>
        </Modal>
    );
}


ErrorModal.propTypes = {
    errorMessage: PropTypes.string.isRequired,
    errorActionMessage: PropTypes.string,
    errorTitle: PropTypes.string,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
};

export default connect()(ErrorModal)