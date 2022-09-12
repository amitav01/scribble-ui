/* eslint-disable react/destructuring-assignment */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { errorMessages } from '../../utils/constants';
import Modal from '../modal/modal';

class ErrorBoundary extends Component {
  componentDidCatch(error) {
    this.props.setAppError(errorMessages.error_boundary);
    // eslint-disable-next-line no-console
    console.error(error);
  }

  render() {
    if (this.props.appError) {
      return <Modal {...this.props.appError} click={this.props.click} />;
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  appError: PropTypes.object,
  setAppError: PropTypes.func.isRequired,
  click: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

ErrorBoundary.defaultProps = {
  appError: null,
};

export default ErrorBoundary;
