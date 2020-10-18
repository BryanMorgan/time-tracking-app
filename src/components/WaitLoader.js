import React, { Component } from 'react'
import { Dimmer, Loader } from 'semantic-ui-react'
import PropTypes from 'prop-types';

const WaitLoader = (props) => {
    return (
        <div className='Global--dimmer-loader'>
            <Dimmer active={props.active} inverted>
                <Loader inline size='large'>{props.message}</Loader>
            </Dimmer>
        </div>
    )
}

WaitLoader.propTypes = {
    message: PropTypes.string.isRequired,
    active: PropTypes.bool.isRequired,
};

export default WaitLoader
