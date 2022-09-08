import { useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Draw from './screens/draw/draw';
import Home from './screens/home/home';
import Lobby from './screens/lobby/lobby';
import {
  saveGameSettings,
  setCurrentPlayer,
  setCurrentRound,
  setCurrentWord,
  setDrawingMode,
  setMessages,
  setOptions,
  setPlayers,
  setScore,
  setShowOption,
} from './store/actions';
import { useSocket } from './utils/useSocket';
import ErrorBoundary from './components/ErrorBoundary/errorBoundary';
import { deviceNotSupportedMessage, errorMessages } from './utils/constants';
import playerJoinedSound from './assets/sounds/player_joined.mp3';
import gameStartedSound from './assets/sounds/start_game.mp3';
import './App.scss';

let firstRender = true;

function App() {
  const { socketId, roomId } = useSelector((state) => state);
  const { listen, removeListener } = useSocket();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [appError, setAppError] = useState();
  const audiosRef = useRef({
    playerJoined: new Audio(playerJoinedSound),
    gameStarted: new Audio(gameStartedSound),
  });
  const locationRef = useRef(); // to access latest location inside callback
  locationRef.current = useLocation();

  useEffect(() => {
    if (firstRender && window.innerWidth < 800) {
      alert(deviceNotSupportedMessage);
      firstRender = false;
    }

    Object.values(audiosRef.current).forEach((audio) => audio.load());
    const handler = (e) => {
      if (locationRef.current.pathname !== '/') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    listen('player-joined', (allPlayers, name, gameStarted) => {
      audiosRef.current.playerJoined.play();
      dispatch(setPlayers(allPlayers));
      if (gameStarted) {
        addMessage(`${name} joined`);
      }
    });

    listen('game-started', (rounds, drawTime) => {
      dispatch(saveGameSettings(rounds, drawTime));
      playGameStartSound();
      navigate('/play');
    });

    listen('joined-ongoing-game', joinedOngoingGame);

    listen('user-left', (name, players, score) => {
      dispatch(setPlayers(players));
      dispatch(setScore(score));
      addMessage(`${name} left the game`);
    });

    listen('server-error', (e) => {
      setAppError(errorMessages.server_error);
      console.error(e);
    });

    return () =>
      removeListener(
        'player-joined',
        'game-started',
        'joined-ongoing-game',
        'user-left',
        'server-error',
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playGameStartSound = () => {
    audiosRef.current.gameStarted.play();
  };

  const joinedOngoingGame = ({
    rounds,
    drawTime,
    currentRound,
    currentWord,
    currrentPlayer,
    score,
    isDrawing,
    currentOptions,
  }) => {
    dispatch(saveGameSettings(rounds, drawTime));
    if (isDrawing) {
      dispatch(setDrawingMode(true));
      addMessage(`${currrentPlayer.name} is drawing`);
    } else {
      if (currrentPlayer.id !== socketId) dispatch(setOptions(currentOptions));
      dispatch(setShowOption(true));
    }
    const theWord =
      currrentPlayer.id !== socketId
        ? currentWord
            .split(' ')
            .map((v) => v.replace(/[a-z|A-Z]/g, '_'))
            .join(' ')
        : currentWord;
    dispatch(setCurrentWord(theWord));
    dispatch(setCurrentRound(currentRound));
    dispatch(setCurrentPlayer(currrentPlayer));
    dispatch(setScore(score));
    navigate('/play');
  };

  const addMessage = (message) => {
    dispatch(
      setMessages({
        id: Math.random().toString().slice(2),
        message,
        system: true,
      }),
    );
  };

  const errorModalClose = () => {
    setAppError();
    navigate('/');
    setTimeout(() => window.location.reload(), 1);
  };

  return (
    <div className="app">
      <div className="main">
        <ErrorBoundary
          appError={appError}
          setAppError={setAppError}
          click={errorModalClose}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            {roomId && (
              <>
                <Route
                  path="/lobby"
                  element={<Lobby playGameStartSound={playGameStartSound} />}
                />
                <Route path="/play" element={<Draw />} />
              </>
            )}
            <Route path="*" element={<Navigate replace to="/" />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </div>
  );
}

export default App;
