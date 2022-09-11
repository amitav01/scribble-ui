import { memo } from 'react';
import './header.scss';

const Header = ({
  rounds,
  currentRound,
  currentWord,
  time,
  totalTime,
  isCurrentUserDrawing,
}) => {
  return (
    <div className="header-container d-flex">
      <div className="round">
        Round: {currentRound}/{rounds}
      </div>
      <div className={`word ${!isCurrentUserDrawing && 'font-25'}`}>
        {time > -1 && currentWord.split(' ').map((v) => <span key={v}>{v}</span>)}
      </div>
      <div className="time d-flex">
        {time > -1 && (
          <>
            <div className="timer">{time}</div>
            <div
              className="time-indicator"
              style={{
                width: `${(time / totalTime) * 100}%`,
                background: time > 10 ? '#00b44b' : '#f30101',
              }}
            ></div>
          </>
        )}
      </div>
    </div>
  );
};

export default memo(Header);
