import { useNavigate } from 'react-router-dom';
import LogoImg from '../../assets/images/logo.png';

const Logo = ({ width }) => {
  const navigate = useNavigate();
  return (
    <div className="logo">
      <img src={LogoImg} onClick={() => navigate('/')} width={width} alt="logo" />
    </div>
  );
};

export default Logo;
