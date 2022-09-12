import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import LogoImg from '../../assets/images/logo.png';

const Logo = ({ width }) => {
  const navigate = useNavigate();
  return (
    <div className="logo">
      <img src={LogoImg} onClick={() => navigate('/')} width={width} alt="logo" />
    </div>
  );
};

Logo.propTypes = {
  width: PropTypes.number.isRequired,
};

export default memo(Logo);
