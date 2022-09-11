import { memo } from 'react';
import { avatars } from '../../utils/constants';
import { useSocket } from '../../utils/useSocket';
import './players.scss';

const Players = ({ roomId, players, score }) => {
  const { socketId } = useSocket();

  return (
    <div className="players-container">
      <div>
        <ul>
          {players.map((p) => (
            <li key={p.id}>
              <div className="d-flex">
                <img src={avatars[p.avatarId]} alt="avatar" width={35} height={35} />
                <div className="player">
                  <div className="name">
                    {p.name}
                    {socketId === p.id && <span> (You)</span>}
                  </div>
                  <div className="score">
                    Score: <span>{score[p.id]?.score ?? 0}</span>
                  </div>
                </div>
              </div>
              <div className="rank">#{score[p.id]?.rank ?? 1}</div>
            </li>
          ))}
        </ul>
      </div>
      <div className="roomId">Room Id: {roomId}</div>
    </div>
  );
};

export default memo(Players);
