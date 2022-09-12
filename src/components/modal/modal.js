import React, { memo } from 'react';
import PropTypes from 'prop-types';
import './modal.scss';

const Modal = ({ title, message, click }) => (
  <div className="modal-container d-flex">
    <div className="modal">
      <div className="header">
        <h2>{title}</h2>
      </div>
      <div className="message">
        <p>{message}</p>
      </div>
      <div className="footer d-flex">
        <button onClick={click} type="button">
          Ok
        </button>
      </div>
    </div>
  </div>
);

Modal.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  click: PropTypes.func.isRequired,
};

export default memo(Modal);
