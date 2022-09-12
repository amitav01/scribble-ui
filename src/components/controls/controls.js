import React, { memo } from 'react';
import PropTypes from 'prop-types';

import useSocket from '../../utils/useSocket';
import { colors, penSizes } from '../../utils/constants';
import './controls.scss';

const Controls = ({
  roomId,
  penColor,
  penSize,
  erase,
  setPenColor,
  setPenSize,
  clearBoard,
  setErase,
}) => {
  const { emit } = useSocket();

  return (
    <div className="controls-container d-flex">
      <div className="selected-color" style={{ background: penColor }} />
      <div className="colors d-flex">
        {colors.map((color) => (
          <div
            key={color}
            style={{ background: color }}
            onClick={() => {
              setPenColor(color);
              emit('select-color', roomId, color);
            }}
          />
        ))}
      </div>
      <div className="pen-sizes d-flex">
        {penSizes.map((size) => (
          <div
            key={size}
            className={`box d-flex ${penSize === size && 'selected'}`}
            onClick={() => {
              setPenSize(size);
              emit('select-brush', roomId, size);
            }}
          >
            <div style={{ width: `${size}px`, height: `${size}px` }} />
          </div>
        ))}
      </div>
      <div className={`box d-flex ${!erase && 'selected'}`}>
        <button
          onClick={() => {
            emit('erase', roomId, false);
            setErase(false);
          }}
          className="brush"
          type="button"
        />
      </div>
      <div className={`box d-flex ${erase && 'selected'}`}>
        <button
          onClick={() => {
            emit('erase', roomId, true);
            setErase(true);
          }}
          className="erase"
          type="button"
        />
      </div>
      <div className="box d-flex">
        <button className="clear" onClick={clearBoard} type="button" />
      </div>
    </div>
  );
};

Controls.propTypes = {
  roomId: PropTypes.string.isRequired,
  penColor: PropTypes.string.isRequired,
  penSize: PropTypes.object.isRequired,
  erase: PropTypes.bool.isRequired,
  setPenColor: PropTypes.func.isRequired,
  setPenSize: PropTypes.func.isRequired,
  clearBoard: PropTypes.func.isRequired,
  setErase: PropTypes.func.isRequired,
};

export default memo(Controls);
