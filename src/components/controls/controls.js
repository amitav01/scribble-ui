import { memo } from 'react';

import { useSocket } from '../../utils/useSocket';
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
      <div className="selected-color" style={{ background: penColor }}></div>
      <div className="colors d-flex">
        {colors.map((color) => (
          <div
            key={color}
            style={{ background: color }}
            onClick={() => {
              setPenColor(color);
              emit('select-color', roomId, color);
            }}
          ></div>
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
            <div style={{ width: `${size}px`, height: `${size}px` }}></div>
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
        ></button>
      </div>
      <div className={`box d-flex ${erase && 'selected'}`}>
        <button
          onClick={() => {
            emit('erase', roomId, true);
            setErase(true);
          }}
          className="erase"
        ></button>
      </div>
      <div className="box d-flex">
        <button className="clear" onClick={clearBoard}></button>
      </div>
    </div>
  );
};

export default memo(Controls);
