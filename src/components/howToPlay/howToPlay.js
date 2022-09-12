import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { howToPlayTexts } from '../../utils/constants';
import './howToPlay.scss';

const HowToPlay = ({ close }) => (
  <div className="how-to-play d-flex">
    <div className="modal">
      <div className="header">
        <h2>How To Play</h2>
        <button className="close" onClick={close} type="button">
          ×
        </button>
      </div>
      <div className="body">
        <ul>
          {howToPlayTexts.map((text) => (
            <li key={text}>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

HowToPlay.propTypes = {
  close: PropTypes.func.isRequired,
};

export default memo(HowToPlay);
