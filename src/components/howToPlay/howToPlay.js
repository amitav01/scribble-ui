import { howToPlayTexts } from '../../utils/constants';
import './howToPlay.scss';

const HowToPlay = ({ close }) => {
  return (
    <div className="how-to-play d-flex">
      <div className="modal">
        <div className="header">
          <h2>How To Play</h2>
          <button className="close" onClick={close}>
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
};

export default HowToPlay;
