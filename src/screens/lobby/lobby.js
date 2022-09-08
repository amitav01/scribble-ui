import { useRef, memo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import Logo from '../../components/Logo/Logo';
import Spinner from '../../components/spinner/spinner';
import { saveGameSettings } from '../../store/actions';
import { drawTimes, avatars } from '../../utils/constants';
import { useSocket } from '../../utils/useSocket';
import './lobby.scss';

const Lobby = ({ playGameStartSound }) => {
  const { emit, socketId } = useSocket();
  const { roomId, players } = useSelector((state) => state);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [copyText, setCopyText] = useState('Copy');
  const roundsRef = useRef();
  const drawTimeRef = useRef();

  const copy = () => {
    // navigator.clipboard.writeText(roomId); // this code doesn't work in mobile browser
    const element = document.createElement('textarea');
    element.value = roomId;
    document.body.appendChild(element);
    element.select();
    document.execCommand('copy');
    document.body.removeChild(element);
    setCopyText('Copied!');
    setTimeout(() => setCopyText('Copy'), 1500);
  };

  const startGame = async () => {
    if (players.length < 2) return;
    setLoading(true);
    await new Promise((r) => setTimeout(() => r(), 500));
    const rounds = roundsRef.current.value;
    const drawTime = drawTimeRef.current.value;
    dispatch(saveGameSettings(rounds, drawTime));
    emit('start-game', roomId, rounds, drawTime);
    setLoading(false);
    playGameStartSound();
    navigate('/play', { replace: true });
  };

  return (
    <div className="lobby-container">
      <Logo width={200} />
      <div className="header"></div>
      <div>
        <ul className="players d-flex">
          {players.map((p) => (
            <li key={p.id}>
              <div className="d-flex">
                <img src={avatars[p.avatarId]} width={60} height={60} alt="avatar" />
                <div>
                  {p.name.slice(-10)}
                  {socketId === p.id && <span style={{ color: '#ababab' }}> (You) </span>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="invite d-flex card">
        <label>Share the code with your friends</label>
        <span className="info">(Max 6 people can play in a room)</span>
        <div className="d-flex">
          <input type="text" maxLength={10} value={roomId} readOnly />
          <button onClick={copy}>{copyText}</button>
        </div>
      </div>

      {players[0] && (
        <>
          {socketId === players[0].id ? (
            <div className="settings d-flex card">
              <div className="d-flex">
                <label>Rounds</label>
                <select defaultValue={2} ref={roundsRef}>
                  {Array(5)
                    .fill()
                    .map((_, i) => (
                      <option key={i} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                </select>
              </div>
              <div className="d-flex">
                <label>Draw time (seconds)</label>
                <select defaultValue={drawTimes[0]} ref={drawTimeRef}>
                  {drawTimes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <button onClick={startGame} disabled={players.length < 2}>
                  Start Game
                </button>
              </div>
            </div>
          ) : (
            <div className="waiting">
              Waiting for <span>{players[0]?.name}</span> to start the game
            </div>
          )}
        </>
      )}
      {loading && <Spinner />}
    </div>
  );
};

export default memo(Lobby);
