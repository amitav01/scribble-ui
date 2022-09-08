import { useRef, memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { useSocket } from '../../utils/useSocket';
import { setName, setRoomId } from '../../store/actions';
import Logo from '../../components/Logo/Logo';
import ErrorImg from '../../assets/icons/error.png';
import Spinner from '../../components/spinner/spinner';
import HowToPlay from '../../components/howToPlay/howToPlay';
import './home.scss';
import { technologies } from '../../utils/constants';

const Home = () => {
  const { emit } = useSocket();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const nameRef = useRef();
  const roomIdRef = useRef();

  const joinRoom = (roomId, event) => {
    if (!validateName()) return;
    setLoading(true);
    const name = nameRef.current.value;
    emit(event, roomId, name, callback(roomId, name));
  };

  const callback = (roomId, name) => async (error) => {
    if (error) {
      setError(error);
    } else {
      await new Promise((r) => setTimeout(() => r(), 300));
      dispatch(setRoomId(roomId));
      dispatch(setName(name));
      navigate('/lobby', { replace: true });
    }
    setLoading(false);
  };

  const validateName = () => {
    const { value } = nameRef.current;
    if (value.trim() === '') {
      setError('Enter your name');
      return false;
    }
    return true;
  };

  const createRoomClickHandler = () => {
    const roomId = Math.random().toString(32).slice(-10).toLocaleUpperCase();
    joinRoom(roomId, 'create-room');
  };

  const joinRoomClickHandler = () => {
    const { value } = roomIdRef.current;
    if (value.trim() === '') {
      setError('Enter room id');
      return;
    }
    joinRoom(value, 'join-room');
  };

  return (
    <div className="home-container d-flex">
      <Logo />
      <div className="container d-flex">
        <div>
          <input
            type="text"
            ref={nameRef}
            maxLength={10}
            placeholder="Enter your name"
            onFocus={() => setError()}
          />
        </div>
        <div className="room">
          <div>
            <button onClick={createRoomClickHandler}>Create a room</button>
          </div>
          <div className="divider"></div>
          <div className="join-room d-flex">
            <input
              type="text"
              ref={roomIdRef}
              maxLength={10}
              placeholder="Enter Room Id"
              onFocus={() => setError()}
            />
            <button onClick={joinRoomClickHandler}>Join a room</button>
          </div>
        </div>
        {error && (
          <div className="error">
            <img src={ErrorImg} alt="error" width={15} height={15} />
            &ensp;
            <span>{error}</span>
          </div>
        )}
      </div>
      <div className="how-to">
        <button onClick={() => setShowDemo(true)}>How To Play</button>
      </div>
      <div className="attrition">Created by Amitav Mishra</div>
      <div className="tech">
        <div>Made with ❤️ and</div>
        <div>
          <ul className="d-flex">
            {technologies.map((tech) => (
              <li key={tech.name} title={tech.name}>
                <a href={tech.link} target="__blank">
                  <img src={tech.img} alt={tech.name} width={20} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {loading && <Spinner />}
      {showDemo && <HowToPlay close={() => setShowDemo(false)} />}
    </div>
  );
};

export default memo(Home);
