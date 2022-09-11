import { memo } from 'react';
import './spinner.scss';

const Spinner = () => (
  <div className="loader d-flex">
    <div className="spinner"></div>
  </div>
);

export default memo(Spinner);
